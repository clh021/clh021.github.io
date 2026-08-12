package handler

import (
	"context"
	"fmt"
	"strconv"
	"test/response"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-kratos/kratos/v2/log"
	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"github.com/prometheus/common/model"
)

type prometheusHandler struct {
	client api.Client
}

func NewPrometheusHandler(server string) (*prometheusHandler, error) {
	client, err := api.NewClient(api.Config{Address: server})
	if err != nil {
		return nil, err
	}
	return &prometheusHandler{client: client}, nil
}

func (p *prometheusHandler) Test2(c *gin.Context) {

	// 创建Prometheus API客户端配置
	// promConfig := api.Config{
	// 	Address: "http://your-prometheus-server地址:9090",
	// }
	// roundTripper, err := config.NewRoundTripperFromConfig(config.RoundTripperConfig{}, "api-job")
	// if err != nil {
	// 	log.Fatalf("Error creating round tripper: %s", err)
	// }
	// promConfig.HTTPClient.Transport = roundTripper

	// 创建API客户端
	// client, err := api.NewClient(promConfig)
	// if err != nil {
	// 	log.Fatalf("Error creating API client: %s", err)
	// }
	// v1api := v1.NewAPI(client)
	v1api := v1.NewAPI(p.client)

	// 定义查询参数
	query := `sum(rate(node_cpu_seconds_total{mode!="idle"}[1s])) by (instance)`
	startTime := time.Now().Add(-time.Hour)
	endTime := time.Now()

	// 执行查询
	result, warnings, err := v1api.QueryRange(context.Background(), query, v1.Range{
		Start: startTime,
		End:   endTime,
		Step:  time.Minute * 5, // 每5分钟一个数据点
	})
	if err != nil {
		log.Fatalf("Error querying Prometheus: %s", err)
	}
	if len(warnings) > 0 {
		log.Debugf("Warnings: %v", warnings)
	}

	// 解析结果
	matrix, ok := result.(model.Matrix)
	if !ok {
		log.Fatal("Unexpected result type")
	}

	// 打印结果
	for _, series := range matrix {
		log.Debugf("Instance: \n")
		// log.Debugf(*series.Metric["instance"])
		for _, value := range series.Values {
			timestamp := time.Unix(int64(value.Timestamp), 0)
			cpuUsage := value.Value
			log.Debugf("Time: %s, CPU Usage: %.2f\n", timestamp.Format(time.RFC3339), cpuUsage)
		}
	}
}

func (p *prometheusHandler) Test(c *gin.Context) {
	// 创建 Prometheus API 客户端
	api := v1.NewAPI(p.client)
	// addr := "http://192.168.1.21:9090"
	// client, err := api.NewClient(api.Config{Address: addr})
	// if err != nil {
	// 	log.Fatalf("Error creating Prometheus client: %v", err)
	// }
	// api := v1.NewAPI(client)

	// 定义查询表达式，这里以获取所有CPU状态的总秒数为例，实际CPU使用率计算需根据具体需求调整
	query := `sum(rate(node_cpu_seconds_total{mode!="idle"}[5m])) / sum(rate(node_cpu_seconds_total{}[5m])) * 100`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 执行查询
	result, warnings, err := api.Query(ctx, query, time.Now())
	if err != nil {
		log.Fatalf("Error querying Prometheus: %v", err)
	}
	if len(warnings) > 0 {
		fmt.Println("Warnings:", warnings)
	}

	// 处理查询结果
	switch result.Type() {
	case model.ValVector:
		for _, sample := range result.(model.Vector) {
			fmt.Printf("CPU usage: %g%%\n", sample.Value)
		}
	default:
		fmt.Printf("Unexpected result type: %s", result.Type().String())
	}
}

func (p *prometheusHandler) Matrix(c *gin.Context) {
	query := c.Query("query")
	start := c.Query("start")
	end := c.Query("end")
	if query == "" || start == "" {
		query = `node_cpu_seconds_total{mode!="idle"}[5m]`
		// start = "2024-05-30 10:30:00"
		// end = "2024-05-30 11:30:00"
	}
	step, _ := strconv.Atoi(c.Query("step"))

	v1api := v1.NewAPI(p.client)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	s, _ := time.Parse("2006-01-02T15:04:05Z", start)
	e, _ := time.Parse("2006-01-02T15:04:05Z", end)
	r := v1.Range{
		Start: s,
		End:   e,
	}

	if step > 0 {
		r.Step = time.Duration(step) * time.Second
	} else {
		// 不传step就动态控制
		r.Step = dynamicTimeStep(r.Start, r.End)
	}

	obj, _, err := v1api.QueryRange(ctx, query, r)
	if err != nil {
		log.Error(err)
		response.NotOK(c, err)
		return
	}

	response.OK(c, obj)
}

func dynamicTimeStep(start time.Time, end time.Time) time.Duration {
	interval := end.Sub(start)
	if interval < 30*time.Minute {
		return 30 * time.Second // 30 分钟以内，step为30s, 返回60个点以内
	} else {
		return interval / 60 // 返回60个点，动态step
	}
}

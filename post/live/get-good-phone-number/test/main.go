package main

// go run main.go 319193

import (
	"fmt"
	"os"
	"time"

	"github.com/xluohome/phonedata"
)

func formatNumLen2(num int) string {
	numStr := fmt.Sprintf("%d", num)
	if len(numStr) < 2 {
		numStr = fmt.Sprintf("0%s", numStr)
	}

	return numStr
}

func getAllSerPhoneNums(phoneServicePrefix []int, lastFix string) []string {
	var phoneNum []string
	fixStrLen := 11 - 3 - len(lastFix)
	fixMaxNum := 9
	if fixStrLen == 2 {
		fixMaxNum = 99
		for _, num := range phoneServicePrefix {
			for i := 0; i <= fixMaxNum; i++ {
				phoneNum = append(phoneNum, fmt.Sprintf("%d%s%s", num, formatNumLen2(i), lastFix))
			}
		}
	} else {
		for _, num := range phoneServicePrefix {
			for i := 0; i <= fixMaxNum; i++ {
				phoneNum = append(phoneNum, fmt.Sprintf("%d%d%s", num, i, lastFix))
			}
		}
	}
	return phoneNum
}

func getAllPhoneNums(youNumLast string) []string {
	yidong := []int{139, 138, 137, 136, 135, 134, 147, 150, 151, 152, 157, 158, 159, 182, 183, 187, 188, 198}
	liantong := []int{130, 131, 132, 155, 156, 185, 186, 166}
	dianxin := []int{133, 153, 180, 181, 189, 191, 199}
	nums := getAllSerPhoneNums(yidong, youNumLast)
	nums = append(nums, getAllSerPhoneNums(liantong, youNumLast)...)
	nums = append(nums, getAllSerPhoneNums(dianxin, youNumLast)...)
	return nums
}

func openFile(filename string) *os.File {
	file, err := os.OpenFile(filename, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)

	if err != nil {
		fmt.Println("无法打开文件:", err)
		return nil
	}
	return file
}

func getCurrentTimestamp() string {
	now := time.Now()
	timestamp := now.Format("20060102_150405")
	return timestamp
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("请输入电话号码最后6位：")
		return
	}

	youNumLast := os.Args[1]
	allNums := getAllPhoneNums(youNumLast)

	allLogFile := openFile(fmt.Sprintf("allNums.%s.log", getCurrentTimestamp()))
	defer allLogFile.Close()

	for _, num := range allNums {
		pr, err := phonedata.Find(fmt.Sprint(num))

		if err != nil {
			fmt.Printf("%s, // ? \r\n", num)
			// panic(err)
		} else {
			txt := fmt.Sprintf("%s, // %s %s \r\n", num, pr.Province, pr.City)
			_, err = allLogFile.WriteString(txt)
			if err != nil {
				fmt.Println("无法写入文件:", err)
				return
			}
			if pr.City == "武汉" {
				fmt.Printf("%s, // %s %s \r\n", num, pr.Province, pr.City)
			}
		}
	}
}

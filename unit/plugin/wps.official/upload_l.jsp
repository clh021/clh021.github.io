<html>
<head>
<%@ page language="java" import="java.io.*" %>
<%@ page language="java" contentType="text/html" pageEncoding="utf-8" %>
<meta http-equiv="Content-Type" content="text/html; charset=UTF8">
<title>This page for response</title>
</head>
<body>    
<%    
	//Cookie[] cookies = request.getCookies();
	//for (Cookie cookie : cookies) {
	//   System.out.println(cookie.getName() + " : " + cookie.getValue());
	//}

	String userid = (String)(session.getAttribute("userid"));
	System.out.println("*****************************************************");
	if(userid==null){ 
		out.print("No login!");
		System.out.println("没有登录!");
	}else{
		System.out.println("已登录! 当前用户: " + userid);
	}

try {      
	out.print(request.getContentLength());
	System.out.println("ContentLength=" + request.getContentLength());
	if (request.getContentLength() > 0) 
	{           
		
		InputStream in = request.getInputStream();
		String localfileName = request.getHeader("filename");
		localfileName = new String(localfileName.getBytes("iso-8859-1"),"UTF-8");
		System.out.println(localfileName);
		//String localfileName = "test.wps";
		if(localfileName != null && !localfileName.isEmpty())
		{
			String realFileName = request.getSession().getServletContext().getRealPath("/") + localfileName;
			File f = new File(realFileName);
			FileOutputStream o = new FileOutputStream(f);
			byte b[] = new byte[1024];
			int n;
			while ((n = in.read(b)) != -1)
			{               
				o.write(b, 0, n);
			}
           		o.close();
		        in.close();
		        out.print("File upload success!");  
               //获取客户端传入的md5值  
                       String localmd5 = request.getHeader("md5sum");

		       System.out.println("md5sum = " + localmd5);

		       out.println("md5sum = " + localmd5);      
		}
		else
		{
		        out.print("filename is null!");          
		        System.out.println("filename is null!");          
			
		}
	} 
	else
	{
              		out.print("No file!");
        }
       } 
	catch (IOException e)
	 {
	           out.print("upload error.");
           		e.printStackTrace();
       }
%>    
</body>
</html>

#!/bin/bash -eu
# leehom Chen clh021@gmail.com
export LITHIUM_ENABLE_XPC_URLS='http://localhost:8000;http://localhost:3000'
lithiumPath="/home/chenlianghong/Projects/lithium-frontend/build/dist/lithium"
$lithiumPath/lithium  --appId='12as8.ji_a.com'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=7&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%20appId%3A12as8.ji_a.com%EF%BC%8C%E7%A8%8D%E5%90%8E%E4%BC%9A%E8%81%9A%E7%84%A6%E6%AD%A4%E7%AA%97%E5%8F%A3"
$lithiumPath/lithium  --appId='12as8.ji_a.com'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%20appId%3A12as8.ji_a.com"
$lithiumPath/lithium  --mode='topBar'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86topBar%E6%A8%A1%E5%BC%8F"
$lithiumPath/lithium  --style='background:rgba(0,0,0,0); -moz-appearance: none;'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%E6%A0%B7%E5%BC%8F%E9%80%8F%E6%98%8E"
$lithiumPath/lithium  --skip_bar='true'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%E8%B7%B3%E8%BF%87%E4%BB%BB%E5%8A%A1%E6%A0%8F%20%22skip_bar%22"
$lithiumPath/lithium  --user_args='{"fdsa":"f","jgk":33, "topBar":111}'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%22%7B%22user_args%22%3A%22%7B%5C%22fdsa%5C%22%3A%5C%22f%5C%22%2C%5C%22jgk%5C%22%3A33%2C%20%5C%22topBar%5C%22%3A111%7D%22%7D%22"
$lithiumPath/lithium  --width='900' --height='800'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E5%A4%A7%E5%B0%8F%E5%B0%BA%E5%AF%B8%22%7B%22width%22%3A%22900%22%2C%22height%22%3A%22800%22%7D%22"
$lithiumPath/lithium  --positionX='200' --positionY='100' --width='900' --height='800'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E7%AA%97%E5%8F%A3%E4%BD%8D%E7%BD%AE%E8%AE%BE%E7%BD%AE%22%7B%22positionX%22%3A200%2C%22positionY%22%3A100%2C%22width%22%3A%22900%22%2C%22height%22%3A%22800%22%7D%22"
$lithiumPath/lithium  --width='900' --height='800' --winMode='maximize'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E7%AA%97%E5%8F%A3%E7%8A%B6%E6%80%81%E8%AE%BE%E7%BD%AE%22maximize%22"
$lithiumPath/lithium  --hideChrome='true'  "http://localhost:8000/tabs/autoTest/auto.close.html?time=2&msg=%E8%AE%BE%E7%BD%AE%E4%BA%86%E9%9A%90%E8%97%8F%E7%B3%BB%E7%BB%9F%E8%BE%B9%E6%A1%86"

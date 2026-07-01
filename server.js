import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import errorHandle from "./errorHandle.js"; 
// 備註：在 Vite/Webpack 等環境中，後面的 .js 通常可以省略，寫 "./errorHandle" 即可

const todos = [];
const port = 3005;
const requestListener = (req, res) => {
    
    const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
    }

    let body = "";
    // let num = 0;

    req.on("data", (chunk) => {
        // console.log(`第${num}台物流車到！`);
        // console.log(`載了：${chunk.toString()}`);
        body += chunk;
    })

    if(req.url == "/todos" && req.method == "GET"){
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos
        }));
        res.end();
    }else if(req.url == "/todos" && req.method == "POST"){
        req.on("end", ()=> {
            try{
                // console.log("=======物流結束======");
                const title = JSON.parse(body).title;
                if(title !== undefined){
                    const todo = {
                    "title": title,
                    "id": uuidv4()
                };
                todos.push(todo);
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "data":todos
                }));
                res.end();
                }else{
                    errorHandle(res, "缺少 title 資料");
                }
                
            }catch(error){
                errorHandle(res, "資料結構錯誤，或無此todo項目");
            }});
        return;
    }else if(req.url == "/todos" && req.method == "DELETE"){
        todos.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
            "delete": "yes"
        }));
        res.end();
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element => element.id == id);
        if(index !== -1){
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
            "status": "success",
            "data": "已刪除"
        }));
        }else{
            errorHandle(res, "查無此資料或ID錯誤");
        }
        res.end();
    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        req.on("end", ()=>{
            try{
                const title = JSON.parse(body).title;
                const id = req.url.split("/").pop();
                const index = todos.findIndex(element => element.id == id);
                if(title !== undefined && id !== -1){
                    todos[index].title = title;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                    "status": "修改成功",
                    "data": todos[index]
                    }));
                    res.end();
                }else{
                    errorHandle(res, "title格式錯誤或是沒有此id");
                }
            }catch{
                errorHandle(res, "沒有資料可編輯");
            }
        });
    }else if(req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.write("preflighting...");
        res.end();
    }else{
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站"
        }));
        res.end();
    }
    
    // // 挑選你想觀察的資料，包成一個乾淨的小物件
    // const requestInfo = {
    //     method: req.method,
    //     url: req.url,
    //     headers: req.headers
    // };

    // // 將物件轉換成字串，後面的 2 代表排版縮排 2 個空格
    // res.write(JSON.stringify(requestInfo, null, 2)); 
    // res.write(req.url);
   
}
const server = http.createServer(requestListener);
server.listen(port);


var express = require('express');
var path = require('path');
var app=express();

app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname,'public')));
var data={count:0};


app.get('/',function(req,res){
  data.count++;
  console.log(req); console.log(res);
  res.render('my_first_ejs',data);
});
app.get('/reset',function(req,res){
  data.count=0;
  console.log(req); console.log(res);
  res.render('my_first_ejs',data);
});
app.get('/set/count',function(req,res){
  if(req.query.count) data.count=req.query.count;
  res.render('my_first_ejs',data);
  console.log(req); console.log(res);
});
app.get('/set/:num',function(req,res){
  data.count=req.params.num;
  console.log(req); console.log(res);
  res.render('my_first_ejs',data);
});
app.listen(3000,function(){
  console.log('server On!');
});

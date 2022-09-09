//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const _= require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://divyanshSaxena:Divyansh@cluster0.tch6cfr.mongodb.net/toDoList", { useNewUrlParser: true });



const itemsSchema = {
  name: String,

};

const Item = mongoose.model("item", itemsSchema)


const item1 = new Item({
  name: "Welcome to your to DO list!"
});
const item2 = new Item({
  name: "Click '+' to add a new item"
});
const item3 = new Item({
  name: "Use it well"
});


const defaultItems = [item1, item2, item3];

const listsSchema = {
  name: String,
  item: [itemsSchema]

}

const List = mongoose.model("list", listsSchema)




app.get("/", function (req, res) {

  // const day = date.getDate();

  Item.find({}, function (err, foundItem) {

    if (!err) {
      if (foundItem.length === 0) {
        Item.insertMany(defaultItems, function (err) {

          if (err) {
            console.log(err)
          }
          res.redirect("/");
        })
      }
      else {

        res.render("list", { listTitle: "Today", newListItem:foundItem });

      }

    };
  })
})


app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {

    item.save();

    res.redirect("/")
  }
  else {

    List.findOne({ name: listName }, function (err, foundlist) {

      foundlist.item.push(item)
      foundlist.save();
      res.redirect("/" + listName);

    })
  }

});

app.post("/delete",function(req,res){

const checkedItemID = req.body.checkbox;
const listName = req.body.listName;

if(listName ==="Today"){
Item.findByIdAndRemove(checkedItemID,function(err){


if(!err){
  console.log("deleted")
  res.redirect('/')
}
})

}
else{

List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkedItemID}}},function(err,foundlist){

if(!err){


  res.redirect("/"+listName);
}

});



}




})



app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListname", function (req, res) {
  const customListName = _.capitalize(req.params.customListname);
  List.findOne({ name: customListName }, function (err, foundlist) {

    if (!err) {
      if (!foundlist) {
        console.log("doesnt exist")


        const list = new List({
          name: customListName,
          item: defaultItems
        })
        list.save()
        res.redirect("/" + customListName);
      }
      if (foundlist) {
        res.render("list", { listTitle: foundlist.name, newListItem: foundlist.item })

        console.log(" exists")
      }


    }



  })



})


let port = process.env.PORT;
if(port== null||port ==""){
port = 3000;

}
app.listen(port);
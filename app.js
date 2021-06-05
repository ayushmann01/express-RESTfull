const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.info("db connection established");
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Article = new mongoose.model("article", articleSchema);

const article = new Article({
  title: "api",
  content: "this is my first rest api",
});

// article.save((err) => {
//     if(!err) console.log('successful');
//     else console.log(err);
// });

app.get("/", (request, response) => {
  response.send("Hello api demo!");
});

// app.get("/articles", (request, response) => {
//     Article.find({}, (err, articles) => {
//         if (!err) {
//            response.send(articles);
//         }
//         else response.send(err);
//     });
// });

// app.post('/articles', (request, response) => {
//     const title = request.body.title;
//     const content = request.body.content;

//     const article = new Article({
//         title: title,
//         content: content
//     });

//     article.save().then( () => {response.send('successfully added.')} );
// });

// app.delete('/articles', (request, response) => {
//     Article.deleteMany({}, (err) => {
//         if(!err) response.send('successfully deleted.');
//     });
// });

// chained routing

///////////////////////////////////////Targeting specific article/////////////////////////////////////
app
  .route("/articles")
  .get((request, response) => {
    Article.find({}, (err, articles) => {
      if (!err) {
        response.send(articles);
      } else response.send(err);
    });
  })
  .post((request, response) => {
    const title = request.body.title;
    const content = request.body.content;

    const article = new Article({
      title: title,
      content: content,
    });

    article.save().then(() => {
      response.send("successfully added.");
    });
  })
  .delete((request, response) => {
    Article.deleteMany({}, (err) => {
      if (!err) response.send("successfully deleted.");
    });
  });

///////////////////////////////////////Targeting specific article///////////////////////////////////////////
app
  .route("/articles/:title")
  .get((req, res) => {
    Article.findOne(
      {
        title: req.params.title,
      },
      (err, article) => {
        if (article) res.send(article);
        else
          res.send(
            "failed to find any article with title: " + req.params.title
          );
      }
    );
  })
  // put request update/replaces the entire data with new one
  .put((req, res) => {
    Article.update(
      {
        title: req.params.title,
      },
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        overwrite: true,
      },
      (err, result) => {
        if (!err) res.send("successfully updated " + req.params.title);
        else res.send(err);
      }
    );
  })
  // patch request updates the desired specific data only
  .patch((req, res) => {
    Article.update(
      {
        title: req.params.title,
      },
      {
        $set: req.body,
      },
      (err) => {
        if (!err) res.send("successfully updated article");
        else res.send(err);
      }
    );
  })
  .delete((req, res) => {
    Article.deleteOne(
      {
        title: req.params.title,
      },
      (err) => {
        if (!err) res.send("successfully deleted article " + req.params.title);
        else res.send(err);
      }
    );
  });

app.listen(3000 || process.env.PORT, () => {
  console.info("demo_api project connected at port: 3000");
});

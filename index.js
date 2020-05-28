const express = require("express")
const sqlite3 = require('sqlite3').verbose();
const bodyparser = require('body-parser');
const db = new sqlite3.Database("./db/articles.db");
const methodOverride = require('method-override')

const port = process.env.PORT || 3000;
const app = express()

app.set('view engine', 'ejs')

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use('/public', express.static(process.cwd() + '/views'));
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
    db.all('SELECT * FROM articles ORDER BY rowid DESC', (err, articles) => {
        res.render('index', { articles : articles })
      });
})
app.get('/member', async (req, res) => {
    db.all('SELECT * FROM articles ORDER BY rowid DESC', (err, articles) => {
        res.render('member', { articles : articles })
      });
})

//Articles Routes

app.get('/articles/new', (req, res) => {
    res.render('articles/new')
})

app.get ('/articles/member/:id', async(req, res) => {
    const id = req.params.id
    db.all(`SELECT * FROM articles WHERE rowid =${id}`, (err, articles) => {
        res.render(`articles/show_member`,{ articles : articles })
      });
})

app.get ('/articles/:id', async(req, res) => {
    const id = req.params.id
    db.all(`SELECT * FROM articles WHERE rowid =${id}`, (err, articles) => {
        res.render(`articles/show`,{ articles : articles })
      });
})

app.get ('/articles/edit/:id', async(req, res) => {
    const id = req.params.id
    db.all(`SELECT * FROM articles WHERE rowid =${id}`, (err, articles) => {
        res.render(`articles/edit`,{ articles : articles })
      });
})


app.post('/articles', async (req, res) => {
    
    if(req.body.title && req.body.description && req.body.content){
        const createdAt = new Date();
        db.run('INSERT INTO articles(title, description, content, createdAt) VALUES (?, ?, ?, ?)',[req.body.title, req.body.description, req.body.content, createdAt.toLocaleDateString()], function (err) {
            if(err) {
                console.log(err)
                res.render('articles/new')
            }else {
                let id = this.lastID;
                res.redirect(`articles/member/${id}`)
            }
        });
    }else{
        res.render('articles/new.ejs')
    } 
})

app.delete('/articles/:id', async(req, res) => {
    const id = req.params.id
    db.run(`DELETE FROM articles WHERE rowid=${id}`, function(err) {
        if (err) {
          return console.error(err.message);
        }
        res.redirect('/member')
        console.log({id})
        console.log(`Row(s) deleted ${this.changes}`);
      });
})

app.put('/articles/:id', async (req, res) => {
    const id = req.params.id
    db.run(`UPDATE articles SET title=?, description=?, content=? WHERE rowid=?`,[req.body.title, req.body.description, req.body.content, id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        res.redirect(`/member`)
      });
})


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
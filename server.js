const express = require('express');
const app = express();
const db = require('./db');
const { Souvenir, Person, Place, Thing, conn } = db;
app.use(express.urlencoded({ extended: false }));
app.use(require('method-override')('_method'));

const port = process.env.PORT || 3000;

app.get('/', async(req, res, next) => {
  try{
      const people = await Person.findAll();
      const places = await Place.findAll();
      const things = await Thing.findAll();
      const souvenirs = await Souvenir.findAll({
        include: [Person, Place, Thing]
      });
      res.send(`
        <html>
          <head>
          </head>
          <body>
            <h1>ACME Souvenirs</h1>
            <h2>People</h2>
            <ul>
              ${
                people.map(person => {
                  return `
                    <li>
                      ${person.name}
                    </li>
                  `
                }).join('')
              }
            </ul>
            <h2>Places</h2>
            <ul>
              ${
                places.map(place => {
                  return `
                    <li>
                      ${place.name}
                    </li>
                  `
                }).join('')
              }
            </ul>
            <h2>Things</h2>
            <ul>
              ${
                things.map(thing => {
                  return `
                    <li>
                      ${thing.name}
                    </li>
                  `
                }).join('')
              }
            </ul>
            <h2>Add Souvenirs</h2>
            <div>
              <form method='POST' action='/souvenirs'>
                <select name='personId'/>
                  <option value=''>--Select a Person--</option>
                  ${
                    people.map(person => {
                      return `
                        <option value=${person.id}>
                          ${person.name}
                        </option>
                      `
                    }).join('')
                  }
                </select>
                <select name='placeId'/>
                  <option value=''>--Select a Place--</option>
                  ${
                    places.map(place => {
                      return `
                        <option value=${place.id}>
                          ${place.name}
                        </option>
                      `
                    }).join('')
                  }
                </select>
                <select name='thingId'/>
                  <option value=''>--Select a Thing--</option>
                  ${
                    things.map(thing => {
                      return `
                        <option value=${thing.id}>
                          ${thing.name}
                        </option>
                      `
                    }).join('')
                  }
                </select>
                <button>Submit</button>
              </form>
            </div>
            <h2>Souvenirs</h2>
            <ul>
              ${
                souvenirs.map(souvenir => {
                  return `
                    <li>
                      ${souvenir.person.name} owns a ${souvenir.thing.name} that they bought in ${souvenir.place.name}
                    </li>
                    <form method='POST' action='/souvenirs/${souvenir.id}?_method=DELETE'>
                      <button>Delete</button>
                    </form>
                  `
                }).join('')
              }
            </ul>
          </body>
        </html
      `);
  }
  catch(err){
    next(err);
  }
})

app.post('/souvenirs', async(req, res, next) => {
  try{
    console.log(req.body);
    const souvenir = await Souvenir.create(req.body);
    res.redirect('/');
  }
  catch(err){
    next(err);
  }
})

app.delete('/souvenirs/:id', async(req,res,next) => {
  try{
    const souvenir = await Souvenir.findByPk(req.params.id);
    await souvenir.destroy();
    res.redirect('/');
  }
  catch(err){
    next(err);
  }
})

app.listen(port, async()=> {
  try {
    console.log(`listening on port ${port}`);
    await conn.sync({ force: true });
    const [ lucy, moe, larry, ethyl ] = await Promise.all([
      Person.create({ name: 'lucy' }),
      Person.create({ name: 'moe' }),
      Person.create({ name: 'larry' }),
      Person.create({ name: 'ethyl' }),
    ]);

    const [paris, london, NYC, dubai] = await Promise.all([
      Place.create({name: 'paris'}),
      Place.create({name: 'london'}),
      Place.create({name: 'NYC'}),
      Place.create({name: 'dubai'})
    ]);

    const [watch, purse, hat, painting] = await Promise.all([
      Thing.create({name: 'watch'}),
      Thing.create({name: 'purse'}),
      Thing.create({name: 'hat'}),
      Thing.create({name: 'painting'})
    ]);

    await Promise.all([
      Souvenir.create({
        personId: ethyl.id,
        placeId: dubai.id,
        thingId: painting.id
      }),
      Souvenir.create({
        personId: lucy.id,
        placeId: paris.id,
        thingId: watch.id
      }),
    ]);
  }
  catch(ex){
    console.log(ex);
  }
});

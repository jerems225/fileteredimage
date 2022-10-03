import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { generateJwt, requireAuth } from './controllers/auth';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  //CORS Should be restricted
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  app.get("/generatetoken", async (req,res) => {
      const token = await generateJwt();
      res.status(200).send(token);
  })
  
  app.get("/filteredimage",requireAuth, async (req,res) => {

    //URL of a publicly accessible image
    const image_url = req.query.image_url;

    //validate the image_url query
    if(!image_url)
    {
      res.status(400).send("Image url is required");
    }

    //call filterImageFromURL(image_url) to filter the image
    const fileterpath = await filterImageFromURL(image_url);

    // RETURNS the filtered image file
    res.status(200).sendFile(fileterpath, () => {
      //deletes any files on the server on finish of the response
      deleteLocalFiles([fileterpath]);
    })
  })

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
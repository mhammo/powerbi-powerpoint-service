# Power BI PPTX Microservice

## Installation Instructions

Run the following commands:
1. `` npm install ``
2. Run `` npm start `` to start the express server
3. (OPTIONAL) Included is a VS code debug config, feel free to use that to debug the application. It's set to work with the debug library, for any debug thread set with "PROJECT:" in it's name.

## Project Configuration

After installing the npm dependencies above, you'll need to configure the project by adding the relevant fields to config.js. This file contains connection details for MongoDB, and configuration settings for connecting to the Power BI Embedded Azure service.

## Project Structure

The directory structure follows the MVC architecture, with a Service Layer pattern implemented for external services (puppeteer/Power BI Embedded).

./models/ = All mongoose database models go in here.

./controllers/ = Controller methods which facilitate data transfer between mongoose models, service objects and views.

./services/ = Any external service, or any large business logic implementation should be done as a service object/class in the services folder. This represents the service layer of the project.

./views/ = All pug templates go in here

./routes/ = All routing is defined in routing/index.js, these should all just point to the relevant controller function, do not implement controller logic in this file


# ServerDeployment-CA

This is a web application built with Node.js and Express.

## Cyclic.sh Hosted

The app is hosted on Cyclic.sh. Access it at https://blue-cute-sturgeon.cyclic.app/.

## Configuration

To run this application locally, you'll need to set up a .env file with the following configuration:

* CYCLIC_URL=database-url
* CYCLIC_DB=database-user
* CYCLIC_BUCKET_NAME=database-bucket_name
* CYCLIC_APP_ID=database-app-id


## App allows Admin users to create, read, update, and delete participant records. It provides various endpoints for managing participant data, including:

- GET /participants: Retrieve a list of all participants
- POST /participants: Add a new participant
- GET /participants/:email: Retrieve details of a specific participant by email
- GET /participants/work/email: Retrieve work details of a specific participant by email
- GET /participants/home/email: Retrieve home details of a specific participant by email
- GET /participants/details/: Deleted Retrieve all deleted participants
- PUT /participants/:email: Update details of a specific participant by email
- DELETE /participants/:email: Delete a participant by email



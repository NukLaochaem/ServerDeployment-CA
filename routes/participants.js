var express = require("express");
var router = express.Router();

/* GET participant page. */
router.get("/", function (req, res, next) {
  res.send("returning a list of all participants in a JSON object.");
});

//adding the provided participant’s data to the database. Keep in mind the Participant record use case mentioned earlier.
router.post("/add", function (req, res, next) {
  res.send("/add");
});

// returning the personal details of all active participants (including first name and last name).
router.get("/details", function (req, res, next) {
  res.json("/details");
});

//returning all deleted participants' personal details (including first name and last name).
router.get("/details/deleted", function (req, res, next) {
  res.json("/details/deleted");
});

//returning only the personal details of the specified participant (including first name, last name, active). (Only for participants that are not deleted)
router.get("/details/:email", function (req, res, next) {
  res.json("/details/:email");
});

//returning only the specified participant's work details that are not deleted (including their company name and salary with currency).
router.get("/work/:email", function (req, res, next) {
  res.send("/work/:email");
});

//returning only the specified participant's home details that are not deleted (including their country and city).
router.get("/home/:email", function (req, res, next) {
  res.send("/home/:email");
});

// which ‘deletes’ the participant of the provided email from the database.
router.delete("/:email", function (req, res, next) {
  res.send("delete");
});

//which updates the participant of the provided email from the database. The request should have the exact same format as for /participants/add POST request.
router.put("/:email ", function (req, res, next) {
  res.send("Put");
});

module.exports = router;

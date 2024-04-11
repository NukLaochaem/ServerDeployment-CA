var express = require("express");
var router = express.Router();

const CyclicDB = require("@cyclic.sh/dynamodb");
const db = CyclicDB(process.env.CYCLIC_DB);
let participants = db.collection("participants");

/* GET participant page. */
router.get("/", async function (req, res, next) {
  try {
    const allParticipantsResponse = await participants.list();
    const allParticipants = allParticipantsResponse.results;

    res.json(allParticipants);
  } catch (error) {
    console.error("Error retrieving participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//adding the provided participant’s data to the database. Keep in mind the Participant record use case mentioned earlier.
router.post("/add", async function (req, res, next) {
  const { email, firstName, lastName, dob, active, work, home } = req.body;

  if (
    !email ||
    !firstName ||
    !lastName ||
    !dob ||
    active === undefined ||
    !work ||
    !home
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const dobRegex = /^\d{4}\/\d{2}\/\d{2}$|^\d{4}-\d{2}-\d{2}$/;
  if (!dobRegex.test(dob)) {
    return res.status(400).json({
      error: "Invalid date of birth format (YYYY/MM/DD or YYYY-MM-DD)",
    });
  }

  try {
    await participants.set(email, {
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      active: active,
      work: work,
      home: home,
    });
    res.json({ message: "Participant added successfully" });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/details", async function (req, res, next) {
  try {
    const allParticipantsResponse = await participants.list();
    const allParticipants = allParticipantsResponse.results;

    const personalDetails = [];

    for (let i = 0; i < allParticipants.length; i++) {
      const email = allParticipants[i].key;
      const participantRecord = await participants.item(email).get();

      if (participantRecord.props.active) {
        const { firstName, lastName } = participantRecord.props;
        personalDetails.push({ email, firstName, lastName });
      }
    }

    res.json(personalDetails);
  } catch (error) {
    console.error("Error retrieving participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//returning all deleted participants' personal details (including first name and last name).
router.get("/details/deleted", async function (req, res, next) {
  try {
    const allParticipantsResponse = await participants.list();
    const allParticipants = allParticipantsResponse.results;

    const deletedDetails = [];

    for (let i = 0; i < allParticipants.length; i++) {
      const email = allParticipants[i].key;
      const participantDetails = await participants.item(email).get();
      const { firstName, lastName, active } = participantDetails.props;

      if (!active) {
        deletedDetails.push({ email, firstName, lastName });
      }
    }
    res.json(deletedDetails);
  } catch (error) {
    console.error("Error retrieving deleted participant details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//returning only the personal details of the specified participant (including first name, last name, active). (Only for participants that are not deleted)
router.get("/details/:email", async function (req, res, next) {
  const email = req.params.email;

  try {
    const participantDetails = await participants.item(email).get();
    if (participantDetails) {
      const { firstName, lastName, active } = participantDetails.props;
      if (active) {
        res.json({ firstName, lastName, active });
      } else {
        res.status(404).json({ error: "Participant is inactive" });
      }
    } else {
      res.status(404).json({ error: "Participant not found" });
    }
  } catch (error) {
    console.error("Error retrieving participant details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//returning only the specified participant's work details that are not deleted (including their company name and salary with currency).
router.get("/work/:email", async function (req, res, next) {
  const email = req.params.email;

  try {
    const participantDetails = await participants.item(email).get();
    if (
      participantDetails &&
      participantDetails.props.work &&
      participantDetails.props.active
    ) {
      const { companyName, salary, currency } = participantDetails.props.work;

      res.json({ companyName, salary, currency });
    } else {
      res.status(404).json({
        error: "Participant not found or participant has been deleted",
      });
    }
  } catch (error) {
    console.error("Error retrieving participant work details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//returning only the specified participant's home details that are not deleted (including their country and city).
router.get("/home/:email", async function (req, res, next) {
  const email = req.params.email;

  try {
    const participant = await participants.get(email);

    if (participant && participant.props.home && participant.props.active) {
      const { country, city } = participant.props.home;

      res.json({ country, city });
    } else {
      res.status(404).json({
        error: "Participant not found or participant has been deleted",
      });
    }
  } catch (error) {
    console.error("Error retrieving participant home details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// which ‘deletes’ the participant of the provided email from the database.
router.delete("/:email", async function (req, res, next) {
  const email = req.params.email;

  try {
    const participant = await participants.get(email);

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }
    await participants.set(email, { ...participant, active: false });

    res.json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//which updates the participant of the provided email from the database. The request should have the exact same format as for /participants/add POST request.
router.put("/:email", async function (req, res, next) {
  const email = req.params.email;
  const { firstName, lastName, dob, active, work, home } = req.body;

  try {
    const existingParticipant = await participants.get(email);
    if (!existingParticipant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const updatedParticipant = {
      ...existingParticipant,
      firstName: firstName || existingParticipant.firstName,
      lastName: lastName || existingParticipant.lastName,
      dob: dob || existingParticipant.dob,
      active: active !== undefined ? active : existingParticipant.active,
      work: work || existingParticipant.work,
      home: home || existingParticipant.home,
    };

    await participants.set(email, updatedParticipant);

    res.json({ message: "Participant updated successfully" });
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

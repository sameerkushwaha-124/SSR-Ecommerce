const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");


// This route is only available for development phase.
if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res
        .status(503)
        .send("You don't have permission to create new owner!");
    }
    let {fullname, email, password} = req.body;

    let createdOwner = await ownerModel.create({
        fullname:fullname,
        email:email,
        password:password,       
    });
    res.status(201).send(createdOwner);
  });
}

router.get("/", (req, res) => {
  res.send("hello From Owners Router");
});

module.exports = router;

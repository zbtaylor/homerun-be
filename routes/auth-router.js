const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Members = require("../models/members-model.js");
const { generateToken } = require("../middleware/token.js");

router.get('/hello', (req, res) => {
  console.log("This is the req", req.session)
  // todo: Perform auth check if they are in the database. Modify the email string to get a username, add to database if new user.
  res.status(200).json(req.session).end()
})

router.post("/signup", async (req, res, next) => {
  const newMember = req.body;
  if (newMember.email && newMember.password) {
    newMember.password = bcrypt.hashSync(newMember.password, 14);
    Members.insert(newMember)
      .then(member => {
        // TODO: do we want to return something more here?
        res.status(200).json({ message: "Sign up successful." });
      })
      .catch(err => {
        next(err);
      });
  } else {
    res.status(400).json({ message: "Invalid credentials." });
  }
});

router.post("/login", (req, res, next) => {
  const credentials = req.body;
  if (credentials.email && credentials.password) {
    Members.getByEmail(credentials.email)
      .then(member => {
        if (bcrypt.compareSync(credentials.password, member.password)) {
          const token = generateToken(member);
          res.status(200).json({ message: `Welcome, ${member.email}`, token });
        }
      })
      .catch(err => {
        next(err);
      });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

module.exports = router;

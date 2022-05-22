const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(200).json(user);
    //or we can use then instead of awit for handling promises
    // user
    //   .save()
    //   .then((result) => {
    //     res.status(200).json({
    //       message: "user created successfully",
    //       result: result,
    //     });
    //   })
    //   .catch((err) => {
    //     res.status(500).json({ error: err });
    //   });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err", err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    email = req.body.email;
    password = req.body.password;
    if(!!email && !!password) {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");
    res.status(200).json({user,message:"logged in successfully"});
    } else throw new Error(res.status(500).json('one field is missing'));
  } catch (err) {
    res.status(500).json(err);  
    console.log(err);
  }
});

module.exports = router;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.compradorBoard = (req, res) => {
  res.status(200).send("Comprador Content.");
};

exports.montadorBoard = (req, res) => {
  res.status(200).send("Montador Content.");
};
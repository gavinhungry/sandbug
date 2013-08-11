exports.echo = function(req, res) {
  res.render('frame', {
    markup: req.body.markup,
    style: req.body.style,
    script: req.body.script
  });
};

// exports.load = function(req, res) {};
// exports.save = function(req, res) {};

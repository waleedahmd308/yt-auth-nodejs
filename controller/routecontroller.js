const errorView = (req, res) => {
    res.render("userAccountsUploadViews/404.ejs");
    }
 const paymentView = (req, res) => {
    res.render("userAccountsUploadViews/payment.ejs");
}
module.exports =  {
  
    errorView,
    paymentView
};
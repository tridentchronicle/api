var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
const plivo = require('plivo');
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
  
// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});
// connection configurations
var dbConn = {
    host: 'localhost',
    user: 'root',
    password: 'anticounterfeit',
    database: 'abbyfy'
  };
  
  var connection;
  
  function handleDisconnect() {
    connection = mysql.createConnection(dbConn); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();
// connect to database
let plivo = require('plivo');
let client = new plivo.Client('MAMTI0M2U1MTZHYZU2MM', 'YjlkM2VmODk4MTliNGRmM2JmZDlhMDM5MTE3YTEw');
 
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Send otp
app.post('/otp', function (req, res) {
    
    var client = new plivo.Client('MAMTI0M2U1MTZHYZU2MM', 'YjlkM2VmODk4MTliNGRmM2JmZDlhMDM5MTE3YTEw');
    var email = req.body.email;
    var otp = req.body.otp;

    client.messages.create(
      '+17652348514',
      '+91'+email,
      'Your OTP is '+otp
    ).then(function(message_created) {
        return res.send({ error: false, output: message_created, message: 'success' });
    });
    
});

//Add Persons
app.post('/adduser', function (req, res) {
   
    var phone = req.body.phone;
    var last = req.body.last;
    var first = req.body.first;
    var gstin = req.body.gstin;
    connection.query("INSERT INTO Persons(ID, PhoneNo, LastName, FirstName, GSTIN) VALUES(null, ? , ? , ?, ?) ",[phone,last,first,gstin], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//existing user
app.post('/existinguser', function (req, res) {
    
    var phone = req.body.phone;
    connection.query("SELECT * FROM Persons WHERE PhoneNo = ?", phone,function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//create order
app.post('/neworder', function (req, res) {
    
    var phone = req.body.phone;
    var price = req.body.price;
    var delivery = req.body.delivery;
    var discount = req.body.discount;
    var total = req.body.total;
    var createdat = req.body.createdat;
    var updatedat = req.body.updatedat;
    var address = req.body.address;
    var margin = req.body.margin;
    var coupon = req.body.coupon;

    var product = req.body.product;


    var mode = req.body.mode;

    connection.query("INSERT INTO Orders(ID, PersonID,Price,Delivery_Charges,Discount,Total,Created_at,Updated_at,Delivered_on,AddressId,Status,Margin,CouponID) VALUES (null,?,?,?,?,?,?,?,null,?,'Recieved',?,?);",[phone,price,delivery,discount,total,createdat,updatedat,address,margin,coupon], function (error, results, fields) {
       console.log(results.insertId)
       for(var i=0;i<product.length;i++)
       {
       connection.query("INSERT INTO OrderItems(ID,OrderID,ProductID,Quantity,Price,Margin) VALUES(null,?,?,?,?,?)",[results.insertId,product[i].id,product[i].quantity,product[i].price*product[i].quantity,product[i].margin], function (error, results2, fields) {
        
    });
}
connection.query("INSERT INTO Payments(ID, PersonID,OrderID,Mode,Status,Amount,Date_created,Date_modified) VALUES  (null,?,?,?,'Recieved',?,?,?)",[phone,results.insertId,mode,total,createdat,updatedat], function (error, results3, fields) {

});

if(coupon!=null)
{
connection.query("update CouponHistory set Count=Count+1 where PersonID= ? && CouponID= ? ",[phone,coupon], function (error, results4, fields) {
    if(results.affectedRows==1)
    {
        return res.send({ error: false, output: results, message: 'updated' });
    }
    else{
        connection.query("INSERT INTO CouponHistory(ID, PersonID,OrderID,CouponID,Count) VALUES(null,?,?,?,1)",[phone,results.insertId,coupon], function (error, results5, fields) {
            return res.send({ error: false, output: results, message: 'inserted' });
        });
    }
});
}

connection.query("DELETE FROM Cart WHERE PersonID = ?", phone, function (error, results, fields) {
});
return res.send({ error: false, output: results, message: 'success' });
    });
    
});

//make orderitems
app.post('/neworderitems', function (req, res) {
    
    var orderid = req.body.orderid;
    var product = req.body.product;
    var quantity = req.body.quantity;
    var price = req.body.price;
    var margin = req.body.margin;
    
    connection.query("INSERT INTO OrderItems(ID,OrderID,ProductID,Quantity,Price,Margin) VALUES (null,?,?,?,?,?)",[orderid,product,quantity,price,margin], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//payments
app.post('/payments', function (req, res) {
    
    var phone = req.body.phone;
    var orderid = req.body.orderid;
    var mode = req.body.mode;
    var status = req.body.status;
    var amount = req.body.amount;
    var createdat = req.body.createdat;
    var updatedat = req.body.updatedat;

    connection.query("INSERT INTO Payments(ID, PersonID,OrderID,Mode,Status,Amount,Date_created,Date_modified) VALUES (null,?,?,?,?,?,?,?)",[phone,orderid,mode,status,amount,createdat,updatedat], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//coupons
app.post('/coupons', function (req, res) {
    
    var amount = req.body.amount;
    var phone = req.body.phone;
    var expiry = req.body.expiry;
    connection.query(" SELECT Coupons.ID,Coupons.Code,Coupons.Description,Coupons.Amount,Coupons.Minimum_amount,Coupons.Maximum_amount,Coupons.Date_created,Coupons.Date_expires,Coupons.CouponImage FROM Coupons INNER JOIN CouponHistory ON Coupons.ID=CouponHistory.CouponID WHERE CouponHistory.PersonID=? && CouponHistory.Count<Coupons.Usage_limit_per_user && Coupons.Date_expires>? && Coupons.Minimum_amount<=? UNION SELECT Coupons.ID,Coupons.Code,Coupons.Description,Coupons.Amount,Coupons.Minimum_amount,Coupons.Maximum_amount,Coupons.Date_created,Coupons.Date_expires,Coupons.CouponImage FROM Coupons LEFT JOIN CouponHistory ON Coupons.ID=CouponHistory.CouponID && CouponHistory.PersonID=? WHERE CouponHistory.CouponID IS NULL &&  Coupons.Date_expires>? && Coupons.Minimum_amount<=? ORDER BY ID ASC",[phone,expiry,amount,phone,expiry,amount], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//add to coupon history
app.post('/newcouponhistory', function (req, res) {
    
    var phone = req.body.phone;
    var orderid = req.body.orderid;
    var coupon = req.body.coupon;
    connection.query("update CouponHistory set Count=Count+1 where PersonID= ? && CouponID= ? ",[phone,coupon], function (error, results, fields) {
    if(results.affectedRows==1)
    {
        return res.send({ error: false, output: results, message: 'updated' });
    }
    else{
        connection.query("INSERT INTO CouponHistory(ID, PersonID,OrderID,CouponID,Count) VALUES(null,?,?,?,1)",[phone,orderid,coupon], function (error, results, fields) {
            return res.send({ error: false, output: results, message: 'inserted' });
        });
    }
});
});

//Get cart items
app.post('/removecartitems', function (req, res) {
    
    var phone = req.body.phone;
    connection.query("DELETE FROM Cart WHERE PersonID = ?", phone, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});  

//Get cart items
app.post('/removecartitemsbyid', function (req, res) {
    
    var id = req.body.id;
    connection.query("DELETE FROM Cart WHERE ID = ?", id, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});  

//test
app.get('/coup', function (req, res) {
    
    var all;
    var ex1;
    var ex2;
    var ex;
    connection.query("SELECT * FROM Coupons", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
       
        connection.query(" SELECT  DISTINCT Coupons.ID,Coupons.Individual_use FROM Coupons INNER JOIN CouponHistory ON Coupons.ID=CouponHistory.CouponID AND Coupons.Individual_use=1 AND CouponHistory.PersonID = '+917889379345'  ", function (error, results2, fields) {
            return res.send({ error: false, output: all, message: 'ex1' });
        });
            connection.query("SELECT  DISTINCT Coupons.ID,Coupons.Individual_use FROM Coupons INNER JOIN CouponHistory ON Coupons.ID=CouponHistory.CouponID AND Coupons.Individual_use=0 AND CouponHistory.PersonID = '+917889379345' WHERE (Coupons.Minimum_amount> 600 OR Coupons.Usage_limit_per_user > CouponHistory.Count ) "  , function (error, results3, fields) {
                return res.send({ error: false, output: all, message: 'ex2' });
});
              var ex=ex1+ex2;
               console.log(ex)
 
        for(var i=0;i<all.length;i++)
        {
            for(var j=0;j<ex.length;j++)
            {
            if ( all[i].ID === ex[j].ID) {
                all.splice(i, 1); 
                i--;
              }
            }
        }
        console.log(all)
       
  
});

//myorders
app.post('/myorders', function (req, res) {
    
    var phone = req.body.phone;
    connection.query("SELECT OrderItems.OrderID,Orders.Price,Orders.Discount,Orders.Margin,Orders.Created_at,Orders.Total,Orders.PersonID,Address.FirstName,Address.LastName,Address.Flat,Address.Area,Address.Town,Address.State,Address.Pincode,Orders.Status,Orders.Delivered_on,Products.ProductName,Products.BrandName,OrderItems.Price AS ProductPrice,OrderItems.Quantity AS ProductQuantity,OrderItems.Margin AS ProductMargin,Products.ProductImage FROM ((Orders INNER JOIN OrderItems ON Orders.ID=OrderItems.OrderID) INNER JOIN Products ON OrderItems.ProductID = Products.ID) INNER JOIN Address ON Orders.AddressID = Address.ID where Orders.PersonID=? ORDER BY OrderItems.OrderID ASC", phone,function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});




//products
app.post('/products', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM Products", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//products by subcategories
app.post('/productbysub', function (req, res) {
    
    var sub = req.body.sub;
    connection.query("SELECT * FROM Products WHERE SubCategoryName = ?", sub,function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//selective product
app.post('/product', function (req, res) {
    
    var product = req.body.product;
    connection.query("SELECT * FROM Products WHERE ID = ?", product,function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//search product
app.post('/search', function (req, res) {
    
    var product = '%'+req.body.product+'%';
    connection.query("SELECT * FROM Products WHERE ProductName LIKE ? OR BrandName LIKE ? ", [product,product],function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Category
app.post('/categories', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM Category", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Category
app.post('/subcat', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM SubCategory", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Selective SubCategory
app.post('/subcategories', function (req, res) {
    
    var category = req.body.category;
    connection.query("SELECT * FROM SubCategory WHERE CategoryName = ?", category, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Add to Cart
app.post('/addtocart', function (req, res) {
    
    var phone = req.body.phone;
    var product = req.body.product;
    var delivery = req.body.delivery;
    var quantity = req.body.quantity;

    connection.query("update Cart set Quantity=Quantity+? where PersonID= ? && ProductID= ? ",[quantity,phone,product], function (error, results4, fields) {
        if(results.affectedRows==1)
        {
            console.log("updated");
        }
        else{
            connection.query("INSERT INTO Cart(ID, PersonID,ProductID,Delivery_Charges,Quantity) VALUES (null,?,?,?,?)",[phone,product,delivery,quantity], function (error, results2, fields) {
               console.log("inserted");
            });
        }
        return res.send({ error: false, output: results, message: 'updated' });
    });
        
    });

//Get cart items
app.post('/getcartitems', function (req, res) {
    
    var phone = req.body.phone;
    connection.query("SELECT * FROM Cart WHERE PersonID = ?", phone, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});    

//Banner
app.post('/banner', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM Banner", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});
 
// Add new address
app.post('/addaddress', function (req, res) {
    
    var phone = req.body.phone;
    var pincode = req.body.pincode;
    var type = req.body.type;
    var lastname = req.body.lastname;
    var firstname = req.body.firstname;
    var town = req.body.town;
    var state = req.body.state;
    var flat = req.body.flat;
    var area = req.body.area;
    var landmark = req.body.landmark;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;

    
    connection.query("INSERT INTO Address (ID, PhoneNo, Pincode,Type,LastName,FirstName,Town,State,Flat,Area,Landmark,Latitude,Longitude) VALUES (null,?,?,?,?,?,?,? ,?,?,?,?,?)", [phone,pincode,type,lastname,firstname,town,state,flat,area,landmark,latitude,longitude] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Get default address
app.post('/addresstype', function (req, res) {
    
    var phone = req.body.phone;
    var type = req.body.type;
    connection.query("SELECT * FROM Address WHERE PhoneNo = ? && Type = ? ",[phone,type], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Get address by phone
app.post('/addressbyphone', function (req, res) {
    
    var phone = req.body.phone;
    connection.query("SELECT * FROM Address WHERE PhoneNo = ?",phone, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

//Get address by id
app.post('/addressbyid', function (req, res) {
    
    var id = req.body.id;
    connection.query("SELECT * FROM Address WHERE ID = ? ", id, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// Update address
app.post('/updateaddress', function (req, res) {
    
    var phone = req.body.phone;
    var pincode = req.body.pincode;
    var type = req.body.type;
    var lastname = req.body.lastname;
    var firstname = req.body.firstname;
    var town = req.body.town;
    var state = req.body.state;
    var flat = req.body.flat;
    var area = req.body.area;
    var landmark = req.body.landmark;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var id = req.body.id;

    connection.query("UPDATE Address SET PhoneNo = ? , Pincode = ? ,Type = ? ,LastName = ? ,FirstName = ? ,Town = ?,State = ? ,Flat = ? ,Area = ? ,Landmark = ? ,Latitude = ? ,Longitude = ?  WHERE ID = ?", [phone,pincode,type,lastname,firstname,town,state,flat,area,landmark,latitude,longitude,id] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});


//delete address
app.post('/deleteaddress', function (req, res) {
    
    var id = req.body.id;
    connection.query("DELETE FROM Address WHERE ID= ? ",id, function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});




// Login
app.post('/login', function (req, res) {
    
    var email = req.body.email;
    var password = req.body.password;
    var category = req.body.category;
    connection.query("SELECT category FROM users where email = ? AND password = ? AND category = ?", [email, password, category], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// Profile details
app.post('/profile', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM users where email = ?", email , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// all emails
app.post('/emails', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT email FROM users ", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// View Messages
app.post('/mymessages', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM Messages where user_id_from = ? or user_id_to = ?", [email,email] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// Send Messages
app.post('/sendmessages', function (req, res) {
    
    var from = req.body.from;
    var to = req.body.to;
    var content = req.body.content;
    var date = req.body.date;
    connection.query("INSERT INTO Messages ( message_id, user_id_from, user_id_to, content, date_created ) VALUES  ( null, ? , ? , ? , ? )", [from,to,content,date] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});


// Signup
app.post('/signup', function (req, res) {
    
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var address = req.body.address;
    var email = req.body.email;
    var password = req.body.password;
    var category = req.body.category;
    connection.query("INSERT INTO users ( id, first_name, last_name, address, email, password, category ) VALUES  ( null, ? , ? , ? , ? , ? , ?)", [first_name,last_name,address,email,password,category] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

 
 
 
// set port
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});
 
module.exports = app;
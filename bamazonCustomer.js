var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "14551878SW!",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the displayAll function after the connection is made to display items
  displayAll();
});

function displayAll(){
	connection.query("SELECT * FROM products", function(err, results) {
    	if (err) throw err;
    	for(var i = 0; i < results.length; i++){
    		console.log("ID: " + results[i].id + 
    			"\nItem Name: " + results[i].product_name +
    			"\nDepartment: " + results[i].department_name +
    			"\nStock: " + results[i].stock_quantity +
    			"\nPrice: $" + results[i].price);
    		console.log("//////////////////////////////");
    	}
    	inquirer
    		.prompt([
    		{
    			type: "confirm",
    			message: "Want to buy an item?",
    			name: "confirm"
    		}
    		]).then(function(answer) {
    			if(answer.confirm){
    				chooseItem();
    			} else {
    				displayAll();
    			}
    		})
	})
}

function chooseItem(){
	inquirer
      .prompt([
      	{
      		type: "input",
      		message: "Which item do you want to buy?(ID)",
      		name: "item"
      	}
      ]).then(function(answer) {
      	connection.query("SELECT * FROM products WHERE ?",
	      	[
	      		{
	      			id: answer.item
	      		}
	      	], function(err, results) {
	      		if (err) throw err;
	      		var item = results[0];
	      		console.log("You selected: ");
	      		console.log(results[0].product_name);
	      		buyItem(item);
	      	}
      	);
      })
}
		
function buyItem(item){
	inquirer
		.prompt([
			{
        		type: "input",
        	  	message: "Quantity?",
        	  	name: "quantity"
        	}
		]).then(function(answer){
			var input = parseInt(answer.quantity);

	      	if(input > item.stock_quantity || input <= 0){
	      		console.log("Insufficient Quantity.");
	      		chooseItem();
	      	} else {
	      		console.log("Order Successful!");
	      		var newQuantity = item.stock_quantity - input;
	      		// console.log(newQuantity);
	      		// console.log(item.id);
	      		connection.query(
					"UPDATE products SET ? WHERE ?",
					[
			            {
			            	stock_quantity: newQuantity
			            },
			            {
			                id: item.id
			            }
			        ],
			        function(err, results) {
			        	if (err) throw err;
			        	var total = item.price * input;
			        	console.log("Total: $" + total);
			        	inquirer
			    		.prompt([
			    		{
			    			type: "confirm",
			    			message: "Continue Shopping?",
			    			name: "confirm"
			    		}
			    		]).then(function(answer) {
			    			if(answer.confirm){
			    				displayAll();
			    			} else {
			    				console.log("Thank You for shopping with us!");
			    			}
			    		})
			        }
			    );
	      	}
		})
}

function whatToDo(){
	inquirer
		.prompt([
		{
			type: "list",
			message: "What do you want to do?",
			choices: ["Display Inventory", "Check Low Inventory", "Replenish Stock", "Add New Product"],
			name: "action"
		}
		]).then(function(answer){
			switch(answer.action){
				case "Display Inventory":
					displayAll();
					break;
				case "Check Low Inventory":
					displayLow();
					break;
				case "Replenish Stock":
					stockItem();
					break;
				case "Add New Product":
					createItem();
					break;
			}
		})
}

function displayLow(){
	connection.query("SELECT * FROM products WHERE stock_quantity < 5;", function(err, results) {
    	if (err) throw err;
    	for(var i = 0; i < results.length; i++){
    		console.log("ID: " + results[i].id + 
    			"\nItem Name: " + results[i].product_name +
    			"\nDepartment: " + results[i].department_name +
    			"\nStock: " + results[i].stock_quantity +
    			"\nPrice: $" + results[i].price);
    		console.log("//////////////////////////////");
    	}
	})
}

function restockItem(){

}

function createItem(){
	inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the item you would like to add?"
      },
      {
        name: "department",
        type: "input",
        message: "What department does this item belong in?"
      },
      {
        name: "price",
        type: "input",
        message: "How much does this item cost?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "stock",
        type: "input",
        message: "How many will you be adding?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.item,
          department_name: answer.department,
          price: answer.price,
          stock_quantity: answer.stock
        },
        function(err) {
          if (err) throw err;
          console.log("Item Added!");

          whatToDo();
        }
      );
    });
}
const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '=Whwje5MW',
    database: 'employee_trackerDB'
});

connection.connect(function (err) {
    if (err) throw err
    console.log('Connected as Id' + connection.threadId)
    startPrompt();
});


// Initial choice

function startPrompt() {
    inquirer.prompt([
        {
            name: 'choice',
            type: 'rawlist',
            message: 'What do you want to do?',
            choices: [
                'View All Employees?',
                "View All Employee's By Roles?",
                'View all Employees By Deparments',
                'Update Employee',
                'Add Employee?',
                'Add Role?',
                'Add Department?',
            ],
        }
    ]).then(function (val) {
        switch (val.choice) {
            case 'View All Employees?':
                viewAllEmployees();
                break;

            case "View All Employee's By Roles?":
                viewAllRoles();
                break;
            case 'View all Employees By Deparments':
                viewAllDepartments();
                break;

            case 'Update Employee':
                updateEmployee();
                break;

            case 'Add Employee?':
                addEmployee();
                break;

            case 'Add Role?':
                addRole();
                break;

            case 'Add Department?':
                addDepartment();
                break;

            default:
                console.log(`Invalid choice: ${val.choice}`);
                break;
        }
    });
};


// View all employees

function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        });
};

// View all roles
function viewAllRoles() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        });
};

// View all employees by department
function viewAllDepartments() {
    connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
        function (err, res) {
            if (err) throw err
            console.table(res)
            startPrompt()
        })
};

// Add employee prompt: select role title 
var roleArr = [];
function selectRole() {
    connection.query('SELECT * FROM role', function (err, res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++) {
            roleArr.push(res[i].title);
        }

    })
    return roleArr;
};

// Add employee prompt: role queries the managers
var managersArr = [];
function selectManager() {
    connection.query('SELECT first_name, last_name FROM employee WHERE manager_id IS NULL', function (err, res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++) {
            managersArr.push(res[i].first_name);
        }

    })
    return managersArr;
};

// Add employees
function addEmployee() {
    inquirer.prompt([
        {
            name: 'firstname',
            type: 'input',
            message: 'Enter their first name.'
        },
        {
            name: 'lastname',
            type: 'input',
            message: 'Enter their last name.'
        },
        {
            name: 'role',
            type: 'list',
            message: 'What is their role?',
            choices: selectRole()
        },
        {
            name: 'choice',
            type: 'rawlist',
            message: 'Whats their managers name?',
            choices: selectManager()
        }
    ]).then(function (val) {
        var roleId = selectRole().indexOf(val.role) + 1
        var managerId = selectManager().indexOf(val.choice) + 1
        connection.query('INSERT INTO employee SET?',
            {
                first_name: val.firstName,
                last_name: val.lastName,
                manager_id: managerId,
                role_id: roleId

            }, function (err) {
                if (err) throw err
                console.table(val)
                startPrompt()
            });
    });
};

// Update employee
function updateEmployee() {
    connection.query('SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;', function (err, res) {
        if (err) throw err
        console.log(res)
        inquirer.prompt([
            {
                name: 'lastName',
                type: 'rawlist',
                choices: function () {
                    var lastName = [];
                    for (var i = 0; i < res.length; i++) {
                        lastName.push(res[i].last_name);
                    }
                    return lastName;
                },
                message: "What is the Employee's last name? ",
            },
            {
                name: 'role',
                type: 'rawlist',
                message: 'What is the Employees new title?',
                choices: selectRole()
            },
        ]).then(function (val) {
            var roleId = selectRole().indexOf(val.role) + 1
            connection.query('UPDATE employee SET WHERE?',
                {
                    last_name: val.lastName
                },
                {
                    role_id: roleId
                },
                function (err) {
                    if (err) throw err
                    console.table(val)
                    startPrompt()
                });
        });
    });
};

// Adding employee role
function addRole() {
    connection.query('SELECT role.title AS Title, role.salary AS Salary FROM role', function (err, res) {
        inquirer.prompt([
            {
                name: 'Title',
                type: 'input',
                message: 'What is the roles Title?'
            },
            {
                name: 'Salary',
                type: 'input',
                message: 'What is the Salary?'

            }
        ]).then(function (res) {
            connection.query(
                'INSERT INTO role SET?',
                {
                    title: res.Title,
                    salary: res.Salary,
                },
                function (err) {
                    if (err) throw err
                    console.table(res);
                    startPrompt();
                },
            );
        });
    });
};

// Adding department
function addDepartment() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'What Department would you like to add?'
        }
    ]).then(function (res) {
        var query = connection.query(
            'INSERT INTO department SET?',
            {
                name: res.name

            },
            function (err) {
                if (err) throw err
                console.table(res);
                startPrompt();
            },
        );
    });
};

Related Packages:

config: For managing configuration files per environment.
dotenv: For loading environment variables from a .env file.
debug: For logging/debugging during development.

----------------------------------------------------------------------------------------------------
When you set a value like DEBUG=development:*, it's stored as an environment variable, and managing it is the responsibility of the operating system or runtime environment, not the config, dotenv, or debug packages.

1. Where is it stored?

Temporarily in the process environment during runtime.
Available via process.env in Node.js.

2. Who sets it?

You can set it:
In terminal: set DEBUG=development:* (Windows) or export DEBUG=development:* (Linux/macOS).
In .env file (using dotenv).
In CI/CD pipelines or system settings.

3. Who uses it?
Packages like debug, config, etc., read it using process.env.

Example:
// Accessing environment variable
console.log(process.env.DEBUG);

----------------------------------------------------------------------------------------------------

#  Windows command to enable debugging
-> for Windows (Command Prompt):
           set DEBUG=development:*     ->  so that printing in console will work
           set DEBUG=                  ->  it will remove the debug env variable

-> for Windows (PowerShell):
           $env:DEBUG = "development:*"    ->  so that printing in console will work
           Remove-Item Env:DEBUG           ->  it will remove the debug env variable

# Environment-based Configuration (we can set env variable without writing in .env file)
Example : setting an development phase (we do this for security purpose)

Step 1: first check that env variable is present or not ? 
Step 2: console.log(process.env.NODE_ENV)-> it will print undefined (it not present)
Step 3: if not present then set it to development phase.
Step 4: using -> 
        for CMD: set NODE_ENV=development
        for PowerShell: $env:NODE_ENV = "development"
        (with this we are setting the env variable no we are at development phase then config will be as well loaded from config.development.json and many more things will work as well)
Step 5: console.log(process.env.NODE_ENV) -> it will print development
 

---------------------------------------------------------------------------------------------------
# Flash Message
-> you can not use flash without express-session

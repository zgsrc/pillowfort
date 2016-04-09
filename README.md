![Pillow Fort](/package.jpg "Pillow Fort")

# Pillow Fort

Auth system building blocks backed by AWS DynamoDB.

## Design

DynamoDB has higher performance and better scalability than relational databases, making it a good choice for persisting a user database.  

While marginally less performant, it is more scalable, durable, and manageable than in-memory cache clusters (e.g. memcached or redis), making it a similarly good choice for persisting session state.

The data model is pretty standard.  There are users, which have privileges/roles and can have one or more logins.  Multiple logins let many unique identifiers (email, phone, social) all link back to the same system identity, which can be useful.

## Sessions

```javascript
var app = require("express")();

// local session (dev only)
app.use(pf.session.memory({ ... }));

// dynq session (prod or dev)
app.use(pf.session.dynamo(pf.schema, { ... }));
```

## Login

Pillow Fort provides multiple authentication toolkits.

```javascript
var prop = pf.auth.login,
    fb = pf.auth.facebook,
    goog = pf.auth.google;
```

### Proprietary

The proprietary toolkit uses the DynamoDB schema to power the authentication system.  

1. To use the proprietary system, configure it to your specifications.
2. Use the middleware (i.e. `function(req, res, next)`) to piece together a login system.

* config(options)
* register
* login
* verify
* forgotPwd
* resetPwd
* changePwd
* logout

### Facebook

The Facebook toolkit makes it easy to implement a Facebook login flow through the server (rather than the client).

1. To use Facebook, [create](https://developers.facebook.com/docs/apps/register) an application.  
2. Then, choose the [permissions](https://developers.facebook.com/docs/facebook-login/permissions) that you need.
3. Wire up a login flow using the middleware below.
* __redirectUrl(appId, callbackUrl, permissions, state)__ – generates the facebook.com url to which you redirect the user
* __getLoginHandler(appId, callbackUrl, permissions)__ – returns middleware to redirect a user to the facebook.com login page, handling CRSF state through the session infrastructure
* __getAccessToken(appId, appSecret, callbackUrl, code, cb)__ – requests an access token given the code received from a successful facebook login
* __getCallbackHandler(appId, appSecret, callbackUrl, successTemplate, errorTemplate)__ – returns middleware to handle the facebook.com callback after a login attempt
* __getConnectionHandler(schema)__ – returns middleware that creates/updates a login entity from a successfully retrieved access token.

### Google

1. To use Google, [create](https://console.developers.google.com/projectselector/apis/library) an application.  
2. Then, choose the [permissions](https://developers.google.com/identity/protocols/googlescopes) that you need.
3. Wire up a login flow using the middleware below.
* __redirectUrl(appId, callbackUrl, permissions, state)__ – generates the google.com url to which you redirect the user
* __getLoginHandler(appId, callbackUrl, permissions)__ – returns middleware to redirect a user to the google.com login page, handling CRSF state through the session infrastructure
* __getAccessToken(appId, appSecret, callbackUrl, code, cb)__ – requests an access token given the code received from a successful facebook login
* __getCallbackHandler(appId, appSecret, callbackUrl)__ – returns middleware to handle the google.com callback after a login attempt
    
## Model

Low-level operations are exposed through a data model implemented with [Dynq](http://github.com/triploc/dynq).

```javascript
var pf = require("pillowfort");
pf.init({ ... }).create(err => {
    var schema = pf.schema,
        users = schema.tables.users,
        logins = schema.tables.logins,
        sessions = schema.tables.sessions;
});
```

### Users

* create(user, cb)
* modify(user, cb)
* login(user, pwd, cb)
* changePwd(user, oldPwd, newPwd, cb)
* setPwd(user, newPwd, cb)
* forgotPwd(user, cb)
* resetPwd(user, confirmation cb)
* lock(user, cb)
* unlock(user, cb)
* is(id, role, cb)
* grant(id, role, cb)
* rescind(id, role, cb)

### Logins

* forUser(user, cb)
* claim(id, cb)
* connect(profile, user, cb)
* verify(login, user, code, cb)
* bind(login, user, cb)
* free(login, cb)

### Sessions

* destroySession(sid, cb)
* getSession(sid, cb)
* setSession(sid, obj, cb)
* touchSession(sid, obj, cb)
* destroyIdleSession(before, cb)
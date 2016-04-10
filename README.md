![Pillow Fort](/package.jpg "Pillow Fort")

# Pillow Fort

Auth system building blocks backed by AWS DynamoDB.

DynamoDB has higher performance and better scalability than relational databases, making it a good choice for persisting a user data.  While marginally less performant, it is also more scalable, durable, and manageable than in-memory cache clusters (e.g. memcached or redis), making it a similarly good choice for persisting session state.

## Sessions

Sessions are standard mechanism to establish identity in any client-server interaction.  Pillow Fort assumes session infrastructure is present in higher-level middleware.

```javascript
var app = require("express")();

// local session (dev only)
app.use(pf.session.memory({ ... }));

// dynq session (prod or dev)
app.use(pf.session.dynamo(pf.schema, { ... }));
```

## Simple

Pillow Fort provides a simple mechanism to create a login system.

```javascript
pf.auth.router({
    login: {
        maxAttempts: 5
    },
    facebook: { 
        id: "***",
        secret: "***",
        permissions: [ ]
    },
    google: { 
        id: "xyz.apps.googleusercontent.com",
        secret: "***",
        permissions: [ ]
    }
}).mount("/auth", app);

pf.init({ ... }, err => {
    app.listen(80);
});
```

The `router` method creates a [`gencall`](http://github.com/triploc/gencall) router to help with parameter validation.  To enable all `gencall` functionality, use the `mount` method rather than the traditional `app.use` call.

## Advanced

Pillow Fort provides multiple authentication toolkits to customize a login system.  A well-considered login system has a complicated logical flow.

1. A user must be registered with unique login identifiers (e.g. a username), avoiding clashes with existing identities.
2. Passwords are employed to control access to identities.  They should be stored and challenged using an opaque mechanism.
3. Login identifiers often double as communication channels (i.e. email or phone) whose ownership must be verified to establish trust.
4. When passwords are forgotten, a verified communication channel is necessary to facilitate a reset.
5. To prevent hijacking of an authenticated session, best practices requires knowledge of the current password to change the password.
6. Successful login requires a login identifier and a password.  Depending on the user state and application requirements, additional registration steps may be required before accessing protected resources.
7. The system must limit the number of invalid login attempts to prevent brute force attacks.  Once an maximum number of invalid login attempts is reached, an account should be "locked", preventing further login attempts until the identity is unlocked through the verified communication channel.

This flow needs to be implemented and tested in full or a third-party login system (e.g. facebook or google) should be used to automatically handle many of the complexities.  Pillow Fort makes either approach (or a combination) easy.

#### Proprietary

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

#### Social

Pillow Fort comes with OAuth login toolkits for a variety of services.  Each toolkit follows the basic interface set out below.

__redirectUrl(appId, callbackUrl, permissions, state)__
> generates the facebook.com url to which you redirect the user

__getLoginHandler(appId, callbackUrl, permissions)__ 
> returns middleware to redirect a user to the facebook.com login page, handling CRSF state through the session infrastructure

__getAccessToken(appId, appSecret, callbackUrl, code, cb)__ 
> requests an access token given the code received from a successful facebook login

__getCallbackHandler(appId, appSecret, callbackUrl, successTemplate, errorTemplate)__ 
> returns middleware to handle the facebook.com callback after a login attempt

__getConnectionHandler(schema)__ 
> returns middleware that creates/updates a login entity from a successfully retrieved access token.

---

##### Facebook

The Facebook toolkit makes it easy to implement a Facebook login flow through the server (rather than the client).

1. To use Facebook, [create](https://developers.facebook.com/docs/apps/register) an application.  
2. Then, choose the [permissions](https://developers.facebook.com/docs/facebook-login/permissions) that you need.
3. Wire up a login flow using the middleware below.

##### Google

1. To use Google, [create](https://console.developers.google.com/projectselector/apis/library) an application.  
2. Then, choose the [permissions](https://developers.google.com/identity/protocols/googlescopes) that you need.
3. Wire up a login flow using the middleware below.
    
## Model

Low-level operations are exposed through a data model implemented with [Dynq](http://github.com/triploc/dynq).

The data model is pretty standard.  There are users, which have privileges/roles and can have one or more logins.  Multiple logins let many unique identifiers (email, phone, social) all link back to the same system identity, which can be useful.

```javascript
var pf = require("pillowfort");
pf.init({ ... }, err => {
    var schema = pf.schema,
        users = schema.tables.users,
        logins = schema.tables.logins,
        sessions = schema.tables.sessions;
});
```

#### Users

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

#### Logins

* forUser(user, cb)
* claim(id, cb)
* connect(profile, user, cb)
* verify(login, user, code, cb)
* bind(login, user, cb)
* free(login, cb)

#### Sessions

* destroySession(sid, cb)
* getSession(sid, cb)
* setSession(sid, obj, cb)
* touchSession(sid, obj, cb)
* destroyIdleSession(before, cb)
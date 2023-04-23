interface GuacamoleServiceUser
{
    get() :Promise<any>;
    create(password :string) :Promise<any>;
    delete() :Promise<any>;
    addConnection(connectionName :string) :Promise<any>;
    addConnectionGroup(connectionGroupName :string) :Promise<any>;
    addUserGroup(userGroupName :string) :Promise<any>;
}

interface GuacamoleServiceConnection
{
    get() :Promise<any>;
    create(groupName :string, protocol :string, host :string, port :string) :Promise<any>;
    delete() :Promise<any>;
}

interface GuacamoleServiceUserGroup
{
    get() :Promise<any>;
    create() :Promise<any>;
    delete() :Promise<any>;
}

interface GuacamoleServiceConnectionGroup
{
    get() :Promise<any>;
    create() :Promise<any>;
    delete() :Promise<any>;
}

interface IGuacamoleService
{
    user(name :string) :GuacamoleServiceUser;
    connection(name :string) :GuacamoleServiceConnection;
    userGroup(name :string) :GuacamoleServiceUserGroup;
    connectionGroup(name :string) :GuacamoleServiceConnectionGroup;
}


class GuacamoleService implements IGuacamoleService 
{
    static keys :{
        [key: string] :string
    } = {};

    constructor(private apiUrl :string, private adminUsername :string, private adminPassword :string)
    {}

    #getKey() :string
    {
        let key = GuacamoleService.keys[this.apiUrl];
        if(!!key) return key;
        else
        {
            // Request a key
            return '';
        }

        // TODO - add key expiration handling
    }

    user(name :string) :GuacamoleServiceUser {
        return {
            get() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            create(password :string) :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            delete() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            addConnection(connectionName :string) :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            addConnectionGroup(connectionGroupName :string) :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            addUserGroup(userGroupName :string) :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            }
        }
    }

    connection(name :string) :GuacamoleServiceConnection
    {
        return {
            get() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            create(groupName :string, protocol :string, host :string, port :string) :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            delete() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            }
        }
    }

    userGroup(name :string) :GuacamoleServiceUserGroup
    {
        return {
            get() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            create() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            delete() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            }
        }
    }

    connectionGroup(name :string) :GuacamoleServiceConnectionGroup
    {
        return {
            get() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            create() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            },
            delete() :Promise<any>
            {
                return new Promise((resolve,reject) => {reject('because')});
            }
        }
    }
}
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
    static apis :{
        [key: string] :{token :string, dataSource :string}
    } = {};

    constructor(private apiUrl :string, private adminUsername :string, private adminPassword :string)
    {
        this.#getToken();
    }

    async #requireNewToken() :Promise<any>
    {
        let key = await fetch(`${this.apiUrl}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: this.adminUsername,
                password: this.adminPassword
            })
        }).then((res) => res.json());

        return key;
    }

    async #getToken() :Promise<{token :string, dataSource :string}>
    {
        if(!GuacamoleService.apis[this.apiUrl])
        {
            let newKey = await this.#requireNewToken();

            GuacamoleService.apis[this.apiUrl] = {
                token: newKey.authToken,
                dataSource: newKey.dataSource,
            }
        }
        let key = GuacamoleService.apis[this.apiUrl];

        return key;
    }

    // Methods have to retry on 401.

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
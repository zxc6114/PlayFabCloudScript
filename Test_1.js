///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Welcome to your first Cloud Script revision!
//slqgVnxaXGFaKdVTrGiF3ca31rDGZtSK_bg_FFFFFF_tb_3D46F5
// Cloud Script runs in the PlayFab cloud and has full access to the PlayFab Game Server API 
// (https://api.playfab.com/Documentation/Server), and it runs in the context of a securely
// authenticated player, so you can use it to implement logic for your game that is safe from
// client-side exploits. 
//
// Cloud Script functions can also make web requests to external HTTP
// endpoints, such as a database or private API for your title, which makes them a flexible
// way to integrate with your existing backend systems.
//
// There are several different options for calling Cloud Script functions:
//
// 1) Your game client calls them directly using the "ExecuteCloudScript" API,
// passing in the function name and arguments in the request and receiving the 
// function return result in the response.
// (https://api.playfab.com/Documentation/Client/method/ExecuteCloudScript)
// 
// 2) You create PlayStream event actions that call them when a particular 
// event occurs, passing in the event and associated player profile data.
// (https://api.playfab.com/playstream/docs)
// 
// 3) For titles using the Photon Add-on (https://playfab.com/marketplace/photon/),
// Photon room events trigger webhooks which call corresponding Cloud Script functions.
// 
// The following examples demonstrate all three options.
//The states that you reported would show up in the PlayStream Debugger and Event History pages. The sum of these ad events would display in the Rewarded Ads dashboard. So, it’s convenient for you to check the basic KPIs of your ads and track the states of activities.

/*

Is there a documentation page that details the limits of each routes of the Rest API?

Currently, PlayFab does not provide a documentation page detailing the limits of each route for the REST API.

Does Playfab have any recommendation to make the lobby experience seem more realtime? Does the Unreal OnlineSubsystemPlayfab provide realtime updates?

PlayFab provides Multiplayer SDk(Lobby and Matchmaking SDKs) https://learn.microsoft.com/en-us/gaming/playfab/features/multiplayer/lobby/lobby-matchmaking-sdks/lobby-matchmaking-sdks, 
which have built in support for real-time notifications. You may refer to https://learn.microsoft.com/en-us/gaming/playfab/features/multiplayer/lobby/ to have more infomation.



*/

///////////////////////////////////////////////////////////////////////////////////////////////////////

handlers.New_Test=function(args,context)
{
     var matchId = args.matchId; // Retrieve the match ID from the arguments
    var joinCodeValue = args.joinCode; // Save the join code using the match ID as the key
    var DataKey = "JoinCode_Match_" + matchId;
    server.SetTitleData({
        Key: Key,
        Value: joinCodeValue
    });

    // Log the saved value before returning the success message
    log.info("Join code saved: " + joinCode + " for matchId: " + matchId);

    // Return the success message
    return { message: "Join code saved successfully for matchId: " + matchId };
}

handlers.SendEmail=function(args,context)
{
    var accountInfo=server.GetUserAccountInfo({PlayFabId:currentPlayerId});
    
    if(accountInfo.UserInfo.PrivateInfo.Email!=null)
    {
        log.debug(accountInfo.UserInfo.PrivateInfo.Email);
    }
}

handlers.logTest = function (args, context) {
    
    log.debug(args.Test);
    
    var url = "https://zipcloud.ibsnet.co.jp/api/search";
    var method = "get";
    var contentBody = "";
    var contentType = "application/json";
    var headers = {};

    var response = {};
    response = http.request(url, method, contentBody, contentType, headers, true);
    
    return response;
};


handlers.executeCloudScriptTest=function(args,context)
{
    //log.debug(context);
    var displayName=(server.GetPlayerProfile({PlayFabId:currentPlayerId})).PlayerProfile.DisplayName;
    return displayName;
    
}

// 主要处理程序，获取玩家等级
handlers.getPlayerLevel = function (context) {
    try {
        var playerExperience = getPlayerExperience();
        var currencyValue = getPlayerCurrency("GD");
        var playerLevel = calculatePlayerLevel(playerExperience);
        var remainingExperience = calculateRemainingExperience(playerExperience, playerLevel);

        return {
            CurrentLevel: playerLevel,
            CurrentExperience: playerExperience,
            RemainingExperienceForNextLevel: remainingExperience,
            CurrencyValue:currencyValue
        };
    } catch (error) {
        console.error("Error in getPlayerLevel:", error);
        return { error: error.message };
    }
};

// 获取玩家经验值的函数
function getPlayerExperience() {
    var getPlayerDataRequest = {
        PlayFabId: currentPlayerId,
        Keys: ["Experience"]
    };

    var getPlayerDataResponse = server.GetUserData(getPlayerDataRequest);

    if (getPlayerDataResponse && getPlayerDataResponse.Data && getPlayerDataResponse.Data["Experience"]) {
        return parseInt(getPlayerDataResponse.Data["Experience"].Value, 10);
    } else {
        createPlayerExperience("0");
        return 0;
    }
}

// 创建玩家经验值的函数
function createPlayerExperience(value) {
    var createPlayerExperienceRequest = {
        PlayFabId: currentPlayerId,
        Data: {
            "Experience": value
        }
    };
    server.UpdateUserData(createPlayerExperienceRequest);
}

// 计算玩家等级的函数
function calculatePlayerLevel(experience) {
    var baseExperience = 100;
    var experienceMultiplier = 1.15;

    return Math.floor(1 + Math.log(experience / baseExperience) / Math.log(experienceMultiplier));
}

// 计算下一级所需的剩余经验值的函数
function calculateRemainingExperience(totalExperience, currentLevel) {
    var baseExperience = 100;
    var experienceMultiplier = 1.15;

    var requiredExperience = Math.floor(baseExperience * Math.pow(experienceMultiplier, currentLevel - 1));
    return Math.max(0, requiredExperience - totalExperience);
}

// 获取玩家货币值的函数
function getPlayerCurrency(currencyCode) {
    var getUserInventoryRequest = {
        PlayFabId: currentPlayerId
    };
    var userInventory = server.GetUserInventory(getUserInventoryRequest);

    return userInventory && userInventory.VirtualCurrency && userInventory.VirtualCurrency[currencyCode] || 0 ;
}



handlers.GetXsollaLoginToken = function (args) {

    // TODO replace with production credentials
    const projectId = 205789;
    const loginProjectId = "69f995b9-bacc-4069-964a-1d8f05dd46f4";
    const serverOauthClientId = 3112;
    const serverOauthClientSecret = "PNeJ68MrMdNmGgAkFPP7F6YLp6WspV5L";

    const getServerTokenBody =
        "grant_type=client_credentials" +
        `&client_secret=${serverOauthClientSecret}` +
        `&client_id=${serverOauthClientId}`;

    const serverTokenResponse = JSON.parse(
        http.request(
            "https://login.xsolla.com/api/oauth2/token",
            "post",
            getServerTokenBody,
            "application/x-www-form-urlencoded",
            {})
    );

    let serverToken = ""
    if ('access_token' in serverTokenResponse) {
        serverToken = serverTokenResponse.access_token;
    } else {
        return {
            "error_message": "Server token not received"
        }
    }

    const getUserTokenHeaders = {
        "X-Server-Authorization": serverToken
    }

    const getUserTokenBody = JSON.stringify(
        {
            "server_custom_id": currentPlayerId,
        }
    );

    const getUserTokenPath =
        "/api/users/login/server_custom_id?" +
        `projectId=${loginProjectId}&` +
        `publisher_project_id=${projectId}`;

    const userTokenResponse = JSON.parse(
        http.request(
            "https://login.xsolla.com" + getUserTokenPath,
            "post",
            getUserTokenBody,
            "application/json",
            getUserTokenHeaders)
    );

    if ('token' in userTokenResponse) {
        return {
            "token": userTokenResponse.token
        }
    } else {
        return {
            "error_message": "User token not received"
        }
    }
}

handlers.eventtest=function(args,context)
{
var entityProfile = context.currentEntity;
    
 var getFileRequest = {
     Entity : entityProfile.Entity
 };
    
 var file_url;
 var result = entity.GetFiles( getFileRequest );
    
 if ( result && result.Metadata )
 {
     var file_meta = result.Metadata["binary_file.bin"];
    
     if ( file_meta )
     {
         file_url = file_meta.DownloadUrl;
     }
    
     if ( file_url )
     {
         var headers = {
             "Accept": "application/json"
         };
    
         var response = http.request( file_url, "get", "", "application/octet-stream", null, true);  
         log.debug("response1: "+response);
         log.info('Response type: ' + typeof response);
         
         var byteArray = new Uint8Array(response);
         log.info("response2: "+byteArray);
         log.debug("¡¢£¤¥¦§¨©ª")
         
         var hexArray = Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2));
          log.info("response3: "+hexArray);
          return hexArray;
         
         
        //  http.request(file_url, 'GET', '', 'application/octet-stream', null, true, (response) => {
        //      log.debug("response1: "+response);
             
        //     });
        
    
     }      
 }
}

function stringToBytes ( str ) {
    
         log.info( "Converting string of length: " + str.length );
    
         var ch, st, re = [];
         for (var i = 0; i < str.length; i++ ) {
           ch = str.charCodeAt(i);  // get char 
           st = [];                 // set up "stack"
           do {
             st.push( ( ch & 0xFF ).toString(16).padStart(2, "0").toUpperCase() );  // push byte to stack
             ch = ch >> 8;          // shift value down by 1 byte
           }
           while ( ch );
    
           //log.info( "Stack has number of elements: " + st.length );
    
           // add stack contents to result
           // done because chars have "wrong" endianness
           re = re.concat( st.reverse() );
         }
         // return an array of bytes
         log.info( "Returning array of length: " + re.length );
    
         return re;
     }


handlers.MissingParameterTest_1 =function(args,context)
{
    log.info("targetID : "+args.PlayfabId);
    log.info("Name : "+args.name);
    log.info("TestData_1 : "+JSON.stringify(args.TestData));
    return args; 
    
}

handlers.MissingParameterTest_2 =function(args,context)
{
    log.info("targetID : "+args.PlayfabId);
    log.info("TestData_2: "+JSON.stringify(args.TestData));
    return args; 
    
}

handlers.Test = function(args, context) {
    // The function is called with two arguments: args and context

    var today = new Date(); // 获取当前日期和时间
    var dateString = "{\"today\":\""+today.toLocaleDateString()+"\"}"; // 将日期转化为字符串

    return server.SetTitleData({
        // An object is passed to the SetTitleData method
        Key: "test", // The Key property of the object is set to "test"
        Value: dateString
    });
}

handlers.IncrementStat = function (args, context) {
    
         var playerData = server.GetUserInternalData
             ({
                 PlayFabId: currentPlayerId,
             });

        var DeleteObject=(Object.keys(playerData.Data)).filter( key => key.includes("test_") )
        //var result=server.UpdateUserInternalData({PlayFabId: currentPlayerId, KeysToRemove:DeleteObject});

          
        
         return DeleteObject;
         
 };


handlers.HttpTest=function(args,context)
{
 var url = "https://DCF51.playfabapi.com/Admin/UpdateUserTitleDisplayName"; // Define the API endpoint URL
        
// Define the request headers
var headers = {
    "X-SecretKey": "N87UBA4A4AJ9ZD5GUE3A9YZYIQR6YPDUGRRMYUCARSW6OE13MZ" //This is what we pulled from args in previously
};
        
//Define data
var data = {
    "PlayFabId": currentPlayerId,
    "DisplayName": args.DisplayName,
};
 
//Log stuff
const json_data = JSON.stringify(data);
var contentType="application/json"

log.debug(`Data: ${json_data}`);
 
    // Make the request
var reponse=http.request(url, "POST", json_data,contentType,headers);

return {reponse}

}

handlers.Currency_Test=function(args,context)
{
    var result=server.AddUserVirtualCurrency({
         "PlayFabId": currentPlayerId,
         "VirtualCurrency": "GL",
         "Amount": 100
    })
    return result;
}

handlers.WalkRewards_Reset = function(args, context)
{
    
    var request = {
        PlayFabId: currentPlayerId, 
        Statistics:[ {
                StatisticName:"Delete",
                Value:parseInt("123")
                }]
    };
 
    var playerStatResult = server.UpdatePlayerStatistics(request);
    return playerStatResult;
}

// Accept group membership application.
handlers.AutoJoinGroup = function (args,context) {
    
var entityProfile = context.currentEntity;
var group = { Id: args.groupId, Type: "group" }

var result = entity.AcceptGroupApplication(
{
        Group: group,
        Entity: entityProfile.Entity
})
return context;
};

handlers.SetObject=function(args,context)
{
    // create an entity key, set another player's key.
    //sleep(1500)

    
    return server.GetPlayerCombinedInfo({
        
        PlayFabId: currentPlayerId,
        InfoRequestParameters:{
            GetUserAccountInfo: true
        }
    });
    
    var apiResult = entity.SetObjects({
        Entity: context.currentEntity.Entity,
        Objects:  [
            {
                ObjectName: "gifts",
                DataObject: {},
            }
        ]
    });
    return apiResult;
    
}


function sleep(milliseconds)
{
    const date = Date.now();
    let currentdate=null;
    do{
        currentdate=Date.now();
        
    }while(currentdate-date<milliseconds)
}

handlers.CreateObject=function(args,context)
{
    var targetPlayer = {
        Id: args.TargetId,
        Type:"title_player_account"
    }
 
 var objectsResult= entity.GetObjects({Entity: targetPlayer})
 
 if(!objectsResult.Objects["gifts"]){
     var apiResult = entity.SetObjects({
        Entity: targetPlayer,
        Objects:  [
            {
                ObjectName: "gifts",
                DataObject: {},
                DeleteObject:args.delete
            }
        ]
    });
 }
}

handlers.DeleteObject=function(args, context)
{
     var targetPlayer = {
        Id: args.TargetId,
        Type:"title_player_account"
    }
      object=null
    var apiResult = entity.SetObjects({
        Entity: targetPlayer,
        Objects:  [
            {
                ObjectName: "gifts",
                DataObject: object,
                DeleteObject:args.delete
            }
        ]
    });
}

handlers.SaveEntityFile=function(args,context)
{
    var entityProfile = context.currentEntity;
    entity.InitiateFileUploads({
        "Entity":entityProfile.Entity,
        "FileNames":"Test",
    })
}

handlers.UnBanAllNew = function (args, context){
    
    server.RevokeAllBansForUser({PlayFabId: currentPlayerId});
    
}
handlers.GetOtherDataObject=function(args,context)
{
    var result=entity.GetFiles({
        "Entity": {
                    "Id": args.id,
                    "Type": "title_player_account",
                    "TypeString": "title_player_account",}
                });
}

handlers.GetUserData=function(args,context)
{
    var result = server.GetUserData({PlayFabId: args.id,Keys:args.key});
    var key=args.key;
    return JSON.parse(result.Data[key].Value);
    //return result.Data[key].Value;
}

handlers.WriteCustomDataToItem=function(args,context)
{
    var request= {
        "PlayFabId": "2DDB026E27DAB03A",
        "ItemInstanceId": "AE4A74D965D3B803",
        "Data": {
                    "Equipped": "True",
                    "Slot": "Head",
                    "Test":"test"
                }
    };
    
    log.debug(request);
}

handlers.GetGroupMemberShip=function(args,context)
{
    var result = entity
    log.debug(result);
}


handlers.deletePlayer=function(args,context)
{
    if(JSON.stringify(context.playerProfile.Statistics)=="{}")
    {
        server.DeletePlayer({"PlayFabId":context.playerProfile.PlayerId});
    }
}

handlers.createGroup=function(args,context)
{
    var entityProfile = context.currentEntity;
    
    
    var result= entity.CreateGroup({
            
            Entity:entityProfile.Entity,
            GroupName: "Test0"

        });
}

// This is a Cloud Script function. "args" is set to the value of the "FunctionParameter" 
// parameter of the ExecuteCloudScript API.
// (https://api.playfab.com/Documentation/Client/method/ExecuteCloudScript)
// "context" contains additional information when the Cloud Script function is called from a PlayStream action.
handlers.helloWorld = function (args, context) {
    
    // The pre-defined "currentPlayerId" variable is initialized to the PlayFab ID of the player logged-in on the game client. 
    // Cloud Script handles authenticating the player automatically.
    var message = "Hello " + currentPlayerId + "!";

    // You can use the "log" object to write out debugging statements. It has
    // three functions corresponding to logging level: debug, info, and error. These functions
    // take a message string and an optional object.
    log.info(message);
    var inputValue = null;
    if (args && args.inputValue)
        inputValue = args.inputValue;
    log.debug("helloWorld:", { input: args.inputValue });

    // The value you return from a Cloud Script function is passed back 
    // to the game client in the ExecuteCloudScript API response, along with any log statements
    // and additional diagnostic information, such as any errors returned by API calls or external HTTP
    // requests. They are also included in the optional player_executed_cloudscript PlayStream event 
    // generated by the function execution.
    // (https://api.playfab.com/playstream/docs/PlayStreamEventModels/player/player_executed_cloudscript)
    return { messageValue: message };
};

// This is a simple example of making a PlayFab server API call
handlers.makeAPICall = function (args, context) {
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "Level",
                Value: 2
            }]
    };
    // The pre-defined "server" object has functions corresponding to each PlayFab server API 
    // (https://api.playfab.com/Documentation/Server). It is automatically 
    // authenticated as your title and handles all communication with 
    // the PlayFab API, so you don't have to write extra code to issue HTTP requests. 
    var playerStatResult = server.UpdatePlayerStatistics(request);
};

// This an example of a function that calls a PlayFab Entity API. The function is called using the 
// 'ExecuteEntityCloudScript' API (https://api.playfab.com/documentation/CloudScript/method/ExecuteEntityCloudScript).
handlers.makeEntityAPICall = function (args, context) {

    // The profile of the entity specified in the 'ExecuteEntityCloudScript' request.
    // Defaults to the authenticated entity in the X-EntityToken header.
    var entityProfile = args.Profile;

    // The pre-defined 'entity' object has functions corresponding to each PlayFab Entity API,
    // including 'SetObjects' (https://api.playfab.com/documentation/Data/method/SetObjects).
    var apiResult = entity.SetObjects({
        Entity: entityProfile.Entity,
        Objects: [
            {
                ObjectName: "MemberTest0",
                DataObject: {
                    foo: "some server computed value",
                    prop1: args.prop1
                }
            }
        ]
    });

    return {
        profile: entityProfile,
        setResult: apiResult.SetResults[0].SetResult
    };
};

// This is a simple example of making a web request to an external HTTP API.
handlers.makeHTTPRequest = function (args, context) {
    var headers = {
        "X-MyCustomHeader": "Some Value"
    };
    
    var body = {
        input: args,
        userId: currentPlayerId,
        mode: "foobar"
    };

    var url = "http://httpbin.org/status/200";
    var content = JSON.stringify(body);
    var httpMethod = "post";
    var contentType = "application/json";

    // The pre-defined http object makes synchronous HTTP requests
    var response = http.request(url, httpMethod, content, contentType, headers);
    return { responseContent: response };
};

// This is a simple example of a function that is called from a
// PlayStream event action. (https://playfab.com/introducing-playstream/)
handlers.handlePlayStreamEventAndProfile = function (args, context) {
    
    // The event that triggered the action 
    // (https://api.playfab.com/playstream/docs/PlayStreamEventModels)
    var psEvent = context.playStreamEvent;
    
    // The profile data of the player associated with the event
    // (https://api.playfab.com/playstream/docs/PlayStreamProfileModels)
    var profile = context.playerProfile;
    
    // Post data about the event to an external API
    var content = JSON.stringify({ user: profile.PlayerId, event: psEvent.EventName });
    var response = http.request('https://httpbin.org/status/200', 'post', content, 'application/json', null);

    return { externalAPIResponse: response };
};


// Below are some examples of using Cloud Script in slightly more realistic scenarios

// This is a function that the game client would call whenever a player completes
// a level. It updates a setting in the player's data that only game server
// code can write - it is read-only on the client - and it updates a player
// statistic that can be used for leaderboards. 
//
// A funtion like this could be extended to perform validation on the 
// level completion data to detect cheating. It could also do things like 
// award the player items from the game catalog based on their performance.
handlers.completedLevel = function (args, context) {
    var level = args.levelName;
    var monstersKilled = args.monstersKilled;
    
    var updateUserDataResult = server.UpdateUserInternalData({
        PlayFabId: currentPlayerId,
        Data: {
            lastLevelCompleted: level
        }
    });

    log.debug("Set lastLevelCompleted for player " + currentPlayerId + " to " + level);
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "level_monster_kills",
                Value: monstersKilled
            }]
    };
    server.UpdatePlayerStatistics(request);
    log.debug("Updated level_monster_kills stat for player " + currentPlayerId + " to " + monstersKilled);
};


// In addition to the Cloud Script handlers, you can define your own functions and call them from your handlers. 
// This makes it possible to share code between multiple handlers and to improve code organization.
handlers.updatePlayerMove = function (args) {
    var validMove = processPlayerMove(args);
    return { validMove: validMove };
};


// This is a helper function that verifies that the player's move wasn't made
// too quickly following their previous move, according to the rules of the game.
// If the move is valid, then it updates the player's statistics and profile data.
// This function is called from the "UpdatePlayerMove" handler above and also is 
// triggered by the "RoomEventRaised" Photon room event in the Webhook handler
// below. 
//
// For this example, the script defines the cooldown period (playerMoveCooldownInSeconds)
// as 15 seconds. A recommended approach for values like this would be to create them in Title
// Data, so that they can be queries in the script with a call to GetTitleData
// (https://api.playfab.com/Documentation/Server/method/GetTitleData). This would allow you to
// make adjustments to these values over time, without having to edit, test, and roll out an
// updated script.
function processPlayerMove(playerMove) {
    var now = Date.now();
    var playerMoveCooldownInSeconds = 15;

    var playerData = server.GetUserInternalData({
        PlayFabId: currentPlayerId,
        Keys: ["last_move_timestamp"]
    });

    var lastMoveTimestampSetting = playerData.Data["last_move_timestamp"];

    if (lastMoveTimestampSetting) {
        var lastMoveTime = Date.parse(lastMoveTimestampSetting.Value);
        var timeSinceLastMoveInSeconds = (now - lastMoveTime) / 1000;
        log.debug("lastMoveTime: " + lastMoveTime + " now: " + now + " timeSinceLastMoveInSeconds: " + timeSinceLastMoveInSeconds);

        if (timeSinceLastMoveInSeconds < playerMoveCooldownInSeconds) {
            log.error("Invalid move - time since last move: " + timeSinceLastMoveInSeconds + "s less than minimum of " + playerMoveCooldownInSeconds + "s.");
            return false;
        }
    }

    var playerStats = server.GetPlayerStatistics({
        PlayFabId: currentPlayerId
    }).Statistics;
    var movesMade = 0;
    for (var i = 0; i < playerStats.length; i++)
        if (playerStats[i].StatisticName === "")
            movesMade = playerStats[i].Value;
    movesMade += 1;
    var request = {
        PlayFabId: currentPlayerId, Statistics: [{
                StatisticName: "movesMade",
                Value: movesMade
            }]
    };
    server.UpdatePlayerStatistics(request);
    server.UpdateUserInternalData({
        PlayFabId: currentPlayerId,
        Data: {
            last_move_timestamp: new Date(now).toUTCString(),
            last_move: JSON.stringify(playerMove)
        }
    });

    return true;
}

// This is an example of using PlayStream real-time segmentation to trigger
// game logic based on player behavior. (https://playfab.com/introducing-playstream/)
// The function is called when a player_statistic_changed PlayStream event causes a player 
// to enter a segment defined for high skill players. It sets a key value in
// the player's internal data which unlocks some new content for the player.
handlers.unlockHighSkillContent = function (args, context) {
    var playerStatUpdatedEvent = context.playStreamEvent;
    var request = {
        PlayFabId: currentPlayerId,
        Data: {
            "HighSkillContent": "true",
            "XPAtHighSkillUnlock": playerStatUpdatedEvent.StatisticValue.toString()
        }
    };
    var playerInternalData = server.UpdateUserInternalData(request);
    log.info('Unlocked HighSkillContent for ' + context.playerProfile.DisplayName);
    return { profile: context.playerProfile };
};

// Photon Webhooks Integration
//
// The following functions are examples of Photon Cloud Webhook handlers. 
// When you enable the Photon Add-on (https://playfab.com/marketplace/photon/)
// in the Game Manager, your Photon applications are automatically configured
// to authenticate players using their PlayFab accounts and to fire events that 
// trigger your Cloud Script Webhook handlers, if defined. 
// This makes it easier than ever to incorporate multiplayer server logic into your game.


// Triggered automatically when a Photon room is first created
handlers.RoomCreated = function (args) {
    log.debug("Room Created - Game: " + args.GameId + " MaxPlayers: " + args.CreateOptions.MaxPlayers);
};

// Triggered automatically when a player joins a Photon room
handlers.RoomJoined = function (args) {
    log.debug("Room Joined - Game: " + args.GameId + " PlayFabId: " + args.UserId);
};

// Triggered automatically when a player leaves a Photon room
handlers.RoomLeft = function (args) {
    log.debug("Room Left - Game: " + args.GameId + " PlayFabId: " + args.UserId);
};

// Triggered automatically when a Photon room closes
// Note: currentPlayerId is undefined in this function
handlers.RoomClosed = function (args) {
    log.debug("Room Closed - Game: " + args.GameId);
};

// Triggered automatically when a Photon room game property is updated.
// Note: currentPlayerId is undefined in this function
handlers.RoomPropertyUpdated = function (args) {
    log.debug("Room Property Updated - Game: " + args.GameId);
};

// Triggered by calling "OpRaiseEvent" on the Photon client. The "args.Data" property is 
// set to the value of the "customEventContent" HashTable parameter, so you can use
// it to pass in arbitrary data.
handlers.RoomEventRaised = function (args) {
    var eventData = args.Data;
    log.debug("Event Raised - Game: " + args.GameId + " Event Type: " + eventData.eventType);

    switch (eventData.eventType) {
        case "playerMove":
            processPlayerMove(eventData);
            break;

        default:
            break;
    }
};

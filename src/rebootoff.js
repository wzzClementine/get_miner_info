import AWS from 'aws-sdk';

AWS.config.update({
    region: "ap-southeast-1",
    accessKeyId:"xxxxxxxxxxxxxx",
    secretAccessKey:"xxxxxxxxxxxxxxxxxxx"
});
const dynamodb = new AWS.DynamoDB();



export default function rebootoff (Location, ID,callback) {
    const that = this
    console.log("矿机正在关闭重启功能...");
    const params = {
        ExpressionAttributeNames: {
            "#rf": "rebootingFlag",
        },
        ExpressionAttributeValues: {
            ":rf": {
                N: "0"
            }
        },
        Key: {
            "Location": {
                S: Location   //修改参数
            },
            "ID": {
                S: ID  //修改参数
            }
        },
        ReturnValues: "ALL_NEW",
        TableName: "miner",
        UpdateExpression: "SET  #rf = :rf"
    };
    dynamodb.updateItem(params, function (err, data) {
        if (err){
            console.error("error:",JSON.stringify(err, null, 2));
        } else{
            console.log("已经成功关闭重启功能！",JSON.stringify(data, null, 2));
            if (callback && typeof(callback) === "function") {
                callback(Location,ID);
            }
        }
    });

}


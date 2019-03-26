import React,{ Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import AWS from 'aws-sdk';
import './Buttons.css'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import rebooton from './rebooton.js';
import rebootoff from './rebootoff.js';
import PageComponent from './pageComponent.js';

AWS.config.update({
    region: "ap-southeast-1",
    accessKeyId:"xxxxxxxxxxxx",
    secretAccessKey:"xxxxxxxxxxxxxxxxxxx"
});
const dynamodb = new AWS.DynamoDB();

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            command:"gyskreboot",
            info: [],
            indexList : [], //获取数据的存放数组
            totalNum:'',//总记录数
            totalData:[],
            current: 1, //当前页码
            pageSize:10, //每页显示的条数5条
            goValue:'',
            totalPage:'',//总页数
        }
        this.rebootHandler = this.rebootHandler.bind(this);
        this.pageClick = this.pageClick.bind(this);
        this.goNext = this.goNext.bind(this);
        this.goPre = this.goPre.bind(this);
        this.goSwitchChange = this.goSwitchChange.bind(this);
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    }
    forceUpdateHandler() {
        this.forceUpdate();
    };
    rebootHandler(e){
        const rf = e.target.dataset.rf;
        const ID = e.target.dataset.id;
        const Location = e.target.dataset.location;
        const keyI = e.target.dataset.ky;
        const that = this
        console.log(rf)
        if(rf == 1){
            confirmAlert({
                title: 'Confirm to Close',
                message: 'Miner can not be able to reboot',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            rebootoff(Location, ID,(Location, ID) => {
                                const params = {
                                    Key: {
                                        "Location": {
                                            S: Location
                                        },
                                        "ID": {
                                            S: ID
                                        }
                                    },
                                    TableName: "miner"
                                };
                                dynamodb.getItem(params, function (err, data) {
                                    if (err){
                                        console.error("error:",JSON.stringify(err, null, 2));
                                    } else{
                                        console.log("data:",JSON.stringify(data.Item, null, 2));
                                        const indexList = that.state.indexList;
                                        const index = parseInt(( that.state.current - 1 ) * 10) + parseInt(keyI);
                                        console.log("index",index)
                                        const totalData = that.state.totalData;
                                        indexList[keyI] = data.Item;
                                        totalData[index] = data.Item;
                                        that.setState({
                                           indexList : indexList,
                                            totalData : totalData
                                        })
                                    }
                                });
                            });
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => {
                            //alert("cancel!");
                        }
                    }
                ]
            })
        }else {
            confirmAlert({
                title: 'Confirm to Open',
                message: 'Miner will be able to reboot',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            rebooton(Location, ID,(Location, ID) => {
                                const params = {
                                    Key: {
                                        "Location": {
                                            S: Location
                                        },
                                        "ID": {
                                            S: ID
                                        }
                                    },
                                    TableName: "miner"
                                };
                                dynamodb.getItem(params, function (err, data) {
                                    if (err){
                                        console.error("error:",JSON.stringify(err, null, 2));
                                    } else{
                                        console.log("data:",JSON.stringify(data.Item, null, 2));
                                        const indexList = that.state.indexList;
                                        const index = parseInt(( that.state.current - 1 ) * 10) + parseInt(keyI);
                                        console.log("index",index)
                                        const totalData = that.state.totalData;
                                        indexList[keyI] = data.Item;
                                        totalData[index] = data.Item;
                                        that.setState({
                                            indexList : indexList,
                                            totalData : totalData
                                        })
                                    }
                                });
                            });
                        }

                    },
                    {
                        label: 'No',
                        onClick: () => {
                            //alert("cancel!");
                        }
                    }
                ]
            })
        }
    }
    componentWillMount(){
        const that = this
        const params = {
            TableName:"miner"
        };

        dynamodb.scan(params, function (err, data) {
            if (err){
                console.error("error:", JSON.stringify(err, null, 2));
            } else{
                console.log("data:"+JSON.stringify(data, null, 2));
                const information = data.Items;
                const len = information.length;
                const totalPage = Math.ceil( len / that.state.pageSize);
                console.log(typeof (information));
                that.setState({
                    totalData: information,
                    totalNum: information.length,
                    totalPage: totalPage
                })
                that.pageClick(1);
            }
        });
    }
    //点击翻页
    pageClick(pageNum){
        const that = this;
        //const pageN = that.state.current;
        if(pageNum != that.state.current){
            that.state.current = pageNum
        }
        that.state.indexList=[];//清空之前的数据
        for(let i = (pageNum - 1) * that.state.pageSize; i< that.state.pageSize * pageNum; i++){
            if(that.state.totalData[i]){
                that.state.indexList.push(that.state.totalData[i]);
            }
        }
        that.setState({
           indexList:that.state.indexList,
        })
        //console.log(_this.state.indexList)
    }
    //下一页
    goNext(){
        const that = this;
        let cur = that.state.current;
        //alert(cur+"==="+_this.state.totalPage)
        if(cur < that.state.totalPage){
            that.pageClick(cur + 1);
        }
        console.log(that.state.current)
    }
    //上一页
    goPre(){
        const that = this;
        let cur = that.state.current;
        //alert(cur+"==="+_this.state.totalPage)
        if(cur < that.state.totalPage){
            that.pageClick(cur - 1);
        }
    }
    //跳转到指定页
    goSwitchChange(e){
        var _this= this;
        _this.setState({goValue : e.target.value})
        var value = e.target.value;
        //alert(value+"==="+_this.state.totalPage)
        if(!/^[1-9]\d*$/.test(value)){
            alert('页码只能输入大于1的正整数');
        }else if(parseInt(value) > parseInt(_this.state.totalPage)){
            alert('没有这么多页');
        }else{
            _this.pageClick(value);
        }
    }
    render() {
        return (
            <div className="App">
                <div>
                    <p className="title">Miner    Infomation     List    for    REBOOT</p>
                </div>
                <div>
                    <table className="table4_12">
                        <tr>
                            <th>Location</th>
                            <th>IP</th>
                            <th>Count</th>
                            <th>Time</th>
                            <th>whiteList</th>
                            <th>RebootFunc</th>
                            <th>Maintain</th>
                            <th>Operation</th>
                        </tr>
                        {this.state.indexList.map((item, i) => <Infolist click = {this.rebootHandler}
                                                                         id={i}  info={item}></Infolist> )}
                    </table>
                    <PageComponent  total={this.state.totalNum}
                                    current={this.state.current}
                                    totalPage={this.state.totalPage}
                                    goValue={this.state.goValue}
                                    pageClick={this.pageClick}
                                    goPre={this.goPre}
                                    goNext={this.goNext}
                                    switchChange={this.goSwitchChange}/>
                </div>
            </div>
        );
    }
}

class Infolist extends Component{
    render(){
        return(
            <tr>
                <td>{this.props.info.Location.S}</td>
                <td>{this.props.info.ID.S}</td>
                <td>{this.props.info.count.N}</td>
                <td>{this.props.info.firstTime.M.hour.N+ " in " + this.props.info.firstTime.M.day.N  }</td>
                <td>{(this.props.info.whiteList.N - 1 ) >= 0 ? "Member":"Not"}</td>
                <td>{(this.props.info.rebootingFlag.N - 1) >= 0 ? "Authorization":"Closed"}</td>
                <td>{(this.props.info.mainTainFlag.N - 1 ) >= 0 ? "Maintain":"Normal"}</td>
                <div className="Btnfunc">
                    <button className=" button button-action button-rounded button-small"
                            data-id = {this.props.info.ID.S} data-location = {this.props.info.Location.S}
                            data-rf = {this.props.info.rebootingFlag.N}
                            onClick={this.props.click} data-ky={this.props.id}>
                        {(this.props.info.rebootingFlag.N - 1) >= 0 ? "OFF": "ON"}</button>
                </div>

            </tr>
        )
    }
}
export default App;

import React from 'react';
import {Linking,Text,View} from 'react-native';
import {router} from 'expo-router';
import {breeds} from '../data/catalog';
import {illustrationExampleCount} from '../data/artwork';
import {colors as c} from '../theme';
import {BrandMark} from './graphics';
import {Button,Icon,IconButton,Screen} from './ui';
export default function AboutPanel(){return <Screen>
 <View style={{alignItems:'flex-end',paddingTop:15}}><IconButton name="close" label="关闭关于" onPress={()=>router.canGoBack()?router.back():router.replace('/')} /></View>
 <View style={{alignItems:'center',paddingTop:7,paddingBottom:30}}><BrandMark size={59}/><Text style={{fontSize:30,color:c.text,fontWeight:'700',letterSpacing:-.8,marginTop:20}}>CatXuan</Text><Text style={{fontSize:12,color:c.muted,marginTop:8}}>0.1</Text></View>
 <View style={{flexDirection:'row',gap:12}}>{[[breeds.length,'猫种与家猫类型'],[illustrationExampleCount,'已绘外观示例']].map(([count,label])=><View key={label} style={{flex:1,backgroundColor:'#FFFFFF',padding:19,borderRadius:22}}><Text style={{color:c.green,fontSize:29,fontWeight:'600'}}>{count}</Text><Text style={{color:c.muted,fontSize:12,marginTop:7}}>{label}</Text></View>)}</View>
 <Text style={{color:c.muted,fontSize:13,lineHeight:23,marginTop:14,marginBottom:20}}>毛色与分型仅展示本版已绘示例，不代表全部登记外观。</Text>
 {[
  {icon:'book-outline' as const,title:'资料',text:'参考 CFA、TICA 猫种介绍。地方家猫单独标记，照护和相处标签为编辑归纳。'},
  {icon:'heart-outline' as const,title:'本地记录',text:'无需注册。收藏、对比和选猫偏好保存在本设备，与 CanisXuan 独立。'},
  {icon:'shield-checkmark-outline' as const,title:'照片隐私',text:'照片在设备内分析，模型随应用提供。模型只支持少量外观类别，不能确认品种血统。'},
  {icon:'chatbubble-outline' as const,title:'内容反馈',text:'主动提交的纠错说明、参考链接及所选外观用于资料核对。删除本机记录仅移除设备副本。'},
 ].map(item=><View key={item.title} style={{flexDirection:'row',gap:12,paddingVertical:18,borderTopWidth:1,borderTopColor:c.border}}><View style={{width:35,height:35,borderRadius:12,backgroundColor:c.pale,alignItems:'center',justifyContent:'center'}}><Icon name={item.icon} size={18} color={c.green}/></View><View style={{flex:1}}><Text style={{color:c.text,fontSize:15,fontWeight:'600',marginBottom:5}}>{item.title}</Text><Text style={{color:c.muted,fontSize:13,lineHeight:23}}>{item.text}</Text></View></View>)}
 <Button title="CFA 猫种目录" secondary onPress={()=>{void Linking.openURL('https://cfa.org/breeds/').catch(()=>{});}} style={{marginTop:7}}/>
 <Button title="我的反馈" secondary onPress={()=>router.push({pathname:'/feedback',params:{history:'1'}})} style={{marginTop:10}}/>
 </Screen>;}

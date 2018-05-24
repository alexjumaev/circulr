import React from 'react';
import {Button, Form, Input, Select, Slider,Card,Icon,Radio,Tabs, Popover} from 'antd'
import intl from 'react-intl-universal'
import {connect} from 'dva'
import {calculateGas} from 'LoopringJS/common/utils'
import {configs} from 'common/config/data'
import {isValidInteger} from 'modules/orders/formatters'
import * as fm from 'LoopringJS/common/formatter'

const GasFeeForm = (props) => {
  const {gas, form} = props
  const gasPriceStore = gas.gasPrice
  const gasLimitStore = gas.gasLimit
  const gasLimit = props.gasLimit ? fm.toNumber(props.gasLimit) : fm.toNumber(gasLimitStore)

  if(gasPriceStore.last === 0 && form.getFieldValue('gasSelector') === 'last') {
    form.setFieldsValue({'gasSelector':'estimate'})
  }

  function tabChange(value) {
    gas.tabChange({tabSelected:value})
    form.setFieldsValue({'gasSelector' : 'last'})
  }

  function handleSubmit() {
    form.validateFields((err,values) => {
      if(!err){
        let p = 0, l = 0
        switch(gas.tabSelected){
          case 'easy':
            l = gasLimit
            switch(form.getFieldValue('gasSelector')) {
              case 'last':
                p = gasPriceStore.last
                break;
              case 'estimate':
                p = gasPriceStore.estimate
                break;
              case 'custom':
                p = form.getFieldValue('gasPriceSlider')
                break;
            }
            break;
          case 'advance':
            p = form.getFieldValue('gasPrice')
            l = form.getFieldValue('gasLimit')
            break;
        }
        gas.gasChange({gasPrice:p, gasLimit:l})
      }
    });
  }

  const gasShow = (gasPrice, gasLimit, title) => {
    if(gasPrice && gasLimit) {
      const gas = calculateGas(gasPrice, gasLimit);
      return (
        <div>
          <div className="row justify-content-start">{`${title} ${gas.toString(10)} ETH`}</div>
          <div className="row justify-content-start fs14 color-black-3">{`Gas(${gasLimit}) * Gas Price(${gasPrice} Gwei)`}</div>
        </div>
      )
    }
    return <div>{`${title} 无`}</div>
  }

  return (
    <Popover overlayClassName="place-order-form-popover"
             content={
               <div>
                 <div className="pb10 fs16 color-black-1 zb-b-b">Gas Fee</div>
                 <div className="zb-b">
                   <Tabs defaultActiveKey="easy" onChange={tabChange}>
                     <Tabs.TabPane tab={<div className="pb5">Recommended</div>} key="easy">
                       <Form.Item label={null} colon={false} className="mb0">
                         {form.getFieldDecorator('gasSelector', {
                           initialValue:'last',
                           rules:[]
                         })(
                           <Radio.Group className="d-block w-100">
                             <Radio value='last' className="d-flex align-items-center mb0 w-100 zb-b-b pl15 pr15" disabled={gasPriceStore.last === 0}>
                               <div className="ml5 pt10 pb10">
                                 <div className="fs14 color-black-1">
                                   {gasShow(gasPriceStore.last, gasLimitStore, '上一次')}
                                 </div>
                               </div>
                             </Radio>
                             <Radio value='estimate' className="d-flex align-items-center mb0 w-100 zb-b-b pl15 pr15">
                               <div className="ml5 pt10 pb10">
                                 <div className="fs14 color-black-1">
                                   {gasShow(gasPriceStore.estimate, gasLimit, '推荐')}
                                 </div>
                               </div>
                             </Radio>
                             <Radio value='custom' className="d-flex align-items-center mb0 w-100 zb-b-b pl15 pr15">
                               <div className="ml5 pt10 pb10">
                                 <div className="fs14 color-black-1">
                                   {gasShow(form.getFieldValue('gasPriceSlider'), gasLimit, '自定义')}
                                 </div>
                                 <div>
                                   <Form.Item label={null} colon={false} className="mb0">
                                     {form.getFieldDecorator('gasPriceSlider', {
                                       initialValue:configs.defaultGasPrice,
                                       rules:[]
                                     })(
                                       <Slider min={1} max={99} step={1}
                                               marks={{
                                                 1: intl.get('settings.slow') ,
                                                 99: intl.get('settings.fast') ,
                                               }}
                                       />
                                     )}
                                   </Form.Item>
                                 </div>
                               </div>
                             </Radio>
                           </Radio.Group>
                         )}
                       </Form.Item>
                     </Tabs.TabPane>
                     <Tabs.TabPane tab={<div className="pb5">Advanced</div>} key="advance">
                       <div className="fs12 color-black-3" hidden>
                         { intl.get('settings.gasPrice')+':  '+ gasPriceStore.last+" Gwei" }
                       </div>
                       <div className="fs14 color-black-1 pl10 pr10" style={{minWidth:'300px'}}>
                         <div className="mb15">
                           <Form.Item label='Gas Limit' colon={false} className="mb0">
                             {form.getFieldDecorator('gasLimit', {
                               initialValue:'',
                               rules:[{
                                 message:intl.get('trade.integer_verification_message'),
                                 validator: (rule, value, cb) => isValidInteger(value) ? cb() : cb(true)
                               }]
                             })(
                                <Input className="" />
                             )}
                           </Form.Item>
                         </div>
                         <div className="mb15">
                           <Form.Item label='Gas Price' colon={false} className="mb0">
                             {form.getFieldDecorator('gasPrice', {
                               initialValue:1,
                               rules:[]
                             })(
                               <Slider min={1} max={99} step={1}
                                       marks={{
                                         1: intl.get('token.slow'),
                                         99: intl.get('token.fast')
                                       }}
                               />
                             )}
                         </Form.Item>
                         </div>
                         <div className="mb15 text-left">
                           {
                             form.getFieldValue('gasLimit') && form.getFieldValue('gasPrice') &&
                             <span>
                               {gasShow(form.getFieldValue('gasPrice'), form.getFieldValue('gasLimit'), 'Gas')}
                             </span>
                           }
                         </div>
                       </div>
                     </Tabs.TabPane>
                   </Tabs>
                 </div>
                 <div className="mt20 text-right d-block w-100">
                   <Button onClick={handleSubmit} type="primary" size="large" className="d-block w-100">确认</Button>
                 </div>
               </div>
             }
             trigger="click">
      <a className="fs12 pointer color-black-3 mr5"><Icon type="edit" /></a>
    </Popover>
  );
};

export default Form.create()(GasFeeForm);



import './index'
console.log('test')
var moketable = new window.u.DataTable({
  meta: {
    id: '',
    name: '',
    price: '',
    num: '',
    total: ''
  }
})
let viewmodel = {
  title: ko.observable('i am ucloud-ko-fileupload'),
  exportData: {
     columns: ko.observableArray([
             {'title':'姓名','field': 'name' },
             {'title':'年龄', 'field': 'age'},
             {'title':'个人信息','type': 'render',
                renderFn: function (row) {
                 return  '我叫' + row.name + '年龄' + row.age
                }
              }
    ]),
    rows: ko.observableArray([
      {'name':'姓名1', 'age': '16', },
      {'name':'姓名2', 'age': '161',}
    ]),
  },
  exportdatatable: {
    rows: moketable.rows,
    columns: [{
      title: 'id',
      field: 'id'
    },{
      title: '姓名',
      field: 'name'
    },
    {
      title: '价格',
      field: 'price'
    },
    {
      title: '信息',
      type: 'render',
      renderFn (row) {
        return '姓名：<span>' + row.getValue("name") + '</span>, 单价：<span>' + row.getValue("price") + '</span>'
      }
    }]
  },
  importdata: ko.observable(''), 
  importCallback: function (data) {
    viewmodel.importdata(JSON.stringify(data))
  }
}

ko.applyBindings(viewmodel, document.getElementById('app'))

 setTimeout(() => {
    moketable.setSimpleData([{
      id: 1001,
      name: '张飞牛肉',
      price: 23,
      num: 2,
      total: 46
    }, {
      id: 1002,
      name: '李白猪肉',
      price: 31,
      num: 2,
      total: 46
    }])
  }, 500) 

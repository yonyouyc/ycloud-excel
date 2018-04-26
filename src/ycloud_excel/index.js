/**
*  ko-jsxlsx-excel 简单用法说明 :
* 用户根据 传入参数  {params.type} (string 类型) 可分三种模式
*  1.{params.type == 'import'}  导入excel 生成json 数据, 参数:
*@params: {type: 'import', importCallback: '回调函数, 接受返回json', importText: 'string, 导入按钮文字', disabled: observable(控制按钮可用, 选填)}
*  
* 2. {params.type == 'export'} 导出excel, excel表, 参数:
*   @params: {type: 'export', exportData: '', exportText: 'string, 导出按钮文字', disabled: observable(控制按钮可用, 选填)}
*   {exportData} 导出数据, {custom} 自定义为格式, 默认为false (为标准格式)
*   @custom = false:
*   exportData格式为:
*   params = "exportData: {columns: observableArray,rows:observableArray}"
*   observableArray: 表头数据:
*   exportData.columns = ko.observableArray([
*              {'title':'姓名','field': 'name' },
*              {'title':'年龄', 'field': 'age'},
*              {'title':'个人信息','type': 'render',
*               renderFn: function (row) {
*                return  '我叫' + row.name + '年龄' + row.age
*               },
               }
            ]),
    exportData.rows = ko.observableArray([
      {'name':'姓名1', 'age': '16', },
      {'name':'姓名2', 'age': '161',},
    ]),
*  @params: title: 显示名称, field: 对应表字段, type为render 时, renderFn: 自定义函数
* 
*  @custom = true:
*   exportData = [["表头1","表头2","表头3"],["内容1","内容2","内容3"]]
* 3. {params.type == 'toggle'} 导入导出excel 双功能, 参考见上
*/


import ko from 'knockout'
import XLSX from 'xlsx';
import FileSaver from 'file-saver'
  function entry (params) {
    var self = this
    this.type = params.type || 'toggle' //(string) 操作模式(import: 导出json, export: 导出excel; toggle: 导入导出功能都有)
    this.importCallback = params.importCallback // (function) 导入excel回调函数
    this.importText = params.importText || '模板导入' // (string) 导入按钮文字显示
    
    
    this.exportData = params.exportData || {} // (object) 导出excel数据源
    this.isDataTable = params.isDataTable || false //(boolean)  导出excel 数据类型
    this.exportText = params.exportText || '模板导出' //(string) 导出excel 按钮文字
    this.filename = params.filename || 'excel数据' //(string) 导出excel名称
    
    this.custom = params.custom || false // 自定义原始数据
    this.disabled = params.disabled || false // 按钮是否可用
    this.dropdowntoggle = ko.observable(false)
    
    this.showmore= function () {
      self.dropdowntoggle(!self.dropdowntoggle())
    }
    this.tplexport = function (vm, evt) {
      var excelData = []
      if (this.custom) {
        if (!self.exportData) {
          alert('数据源不正确!')
          return
        }
        excelData = self.exportData()
      } else {
        if (!self.exportData.rows) {
          alert('数据源不正确!')
          return
        }
         // 导出格式
        var headerData = (typeof self.exportData.columns == 'function')?   self.exportData.columns() : self.exportData.columns
        var bodyData = (typeof self.exportData.rows == 'function')?   self.exportData.rows() : self.exportData.rows
        var tableHead = [];
        if (headerData && headerData.length > 0) {
          for(var i = 0; i < headerData.length; i++) {
            tableHead.push(headerData[i].title)
          }
        }
        if (bodyData && bodyData.length > 0) {
          excelData.push(tableHead)
          for(var i = 0; i < bodyData.length; i++) {
            var row = []
            for(var j = 0; j < headerData.length; j++) {
              if (headerData[j].type) {
                if(headerData[j].type == 'render' || headerData[j].type() == 'render') {
                   var rowiteam = headerData[j].renderFn(bodyData[i]).replace(/<[^>]+>/g,"");//去掉所有的html标记
                   row.push(rowiteam)
                } 
              }else {
                var rowiteam = ''
                if (self.isDataTable) {
                  rowiteam = bodyData[i].getValue([headerData[j].field])
                }else{
                  rowiteam = bodyData[i][headerData[j].field]
                }
                row.push(rowiteam)
              }
            }
            excelData.push(row)
          }
        }
      }
      var wb = new Workbook(), ws = sheet_from_array_of_arrays(excelData);
      /* add worksheet to workbook */
      wb.SheetNames.push(self.filename);
      wb.Sheets[self.filename] = ws;
      /* generate workbook object from table */
      /* get binary string as output */
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      /* force a download */
      FileSaver.saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), self.filename + ".xlsx");
    }
    this.filechange = function (vm, evt) {
      if (!self.importCallback || typeof(self.importCallback) != "function") {
        alert('请检查导入回调函数是否正确!')
        return
      }
      var file;
      var files = evt.target.files;
      if (!files || files.length == 0) return;
      file = files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        // pre-process data
        var binary = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        /* read workbook */
        var wb = XLSX.read(binary, {type: 'binary'});
        /* grab first sheet */
        var wsname = wb.SheetNames[0];
        var ws = wb.Sheets[wsname];
        /* generate HTML */
        var json = XLSX.utils.sheet_to_json(ws);
        self.importCallback(json)
        evt.target.value = ''
      };
      reader.readAsArrayBuffer(file);
    }
    // 将[["表头1","表头2","表头3"],["内容1","内容2","内容3"]]转成jsxlsx识别的形式
    function sheet_from_array_of_arrays(data, opts) {
      var ws = {};
      var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
      for(var R = 0; R != data.length; ++R) {
        for(var C = 0; C != data[R].length; ++C) {
          if(range.s.r > R) range.s.r = R;
          if(range.s.c > C) range.s.c = C;
          if(range.e.r < R) range.e.r = R;
          if(range.e.c < C) range.e.c = C;
          var cell = {v: data[R][C] };
          if(cell.v == null) continue;
          var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

          if(typeof cell.v === 'number') cell.t = 'n';
          else if(typeof cell.v === 'boolean') cell.t = 'b';
          else if(cell.v instanceof Date) {
            cell.t = 'n'; cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          }
          else cell.t = 's';

          ws[cell_ref] = cell;
        }
      }
      if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
      return ws;
    }
    function Workbook() {
      if(!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  }
  export default entry
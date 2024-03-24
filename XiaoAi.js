async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {//函数名不要动
  await loadTool('AIScheduleTools')//加载工具包
  console.log("工具包加载完成")
  let html = dom.querySelector("#print-schedule-table > div.table-wrap > table > tbody").innerHTML

  if (html.includes("条未展开")) {
    //return await AIScheduleAlert('诶诶同学!请把未展开的课程展开一下!(◓Д◒)✄╰⋃╯') 
    await AIScheduleAlert({
      titleText: '啊哦！出错了!(・`ω´・)', // 标题内容，字体比较大，不传默认为提示
      contentText: '诶诶同学!请把未展开的课程展开一下!(◓Д◒)✄╰⋃╯\n\n——WJZ_P', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试
      confirmText: '我马上改(ㆀ˘･з･˘)', // 确认按钮文字，可不传默认为确认
    })
    return 'do not continue'
  }
  else {
    return "<table>" + html + "<table>"
  }
}

//}后不要加注释！否则不识别！！！！！！,问题应该在parse函数上

//这个解析函数只能在客户端运行，因为涉及到了dom对象，需要改成$jquery风格
function scheduleHtmlParser(html) {
  //console.log("函数执行中!")
  let result = []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const trs = doc.querySelectorAll("tr")
  //console.log(doc)
  trs.forEach(tr => {//table row，每一行的课程信息

    let day = 0//第一个td是课程节次,因此从0开始。
    const tds = tr.querySelectorAll("td")

    //🐱——————————————————下面是table data的处理——————————————————🐱
    tds.forEach(td => {//table data cell,表单数据单元格，内有课程信息

      const itemContainers = td.querySelectorAll(".item-container")

      //🐱——————————————————下面是容器的处理——————————————————🐱
      itemContainers.forEach(itemContainer => {//容器，里面是真正的课程信息
        const classObj = {}//课程信息

        const spans = itemContainer.querySelectorAll("span")//这个表单内的所有span
        //spans.forEach(span=>{console.log(span.innerHTML)})

        if (spans.length < 7) //注意这里return相当于continue,因为是foreach
        { day += 1; return }//长度为7是单个课程,长度为8是带注释课程

        //下面是spans.textContent的数据示例

        //0 本科 -  计算机组成与结构[992619-004]  0 本科 -  数学实验[992304-001-001E][线性..]
        //1 本科 -  计算机组成与结构              1 本科 -  数学实验
        //2 [992619-004]                         2 [992304-001-001E]
        //3 [1-9,11周]                           3 [线性规划...]
        //4  [10-12节]                           4 [2-9周]
        //5  [10-12节]                           5 [10-13节]
        //6   D1317                              6 [10-13节]
        //                                       7 DS1407

        //console.log("下面准备调用log函数")
        if (spans[1].textContent.includes("-"))
          classObj.name = spans[1].textContent.split("-")[1].trim()//设置课程名
        else
          classObj.name = spans[1].textContent

        //console.log("设置课程名成功")
        classObj.position = spans[spans.length - 1].textContent.trim()//设置上课点,最后一个元素
        //console.log("设置上课点成功")
        classObj.teacher = "没,,Ծ‸Ծ,,有"          //太抽象了，居然没有显示老师!!!∑(ﾟДﾟノ)ノ
        classObj.day = day                       //设置是星期几

        //🐱下面设置sections属性，即上课节次.🐱

        let sectionString = spans[spans.length - 2].textContent.trim()//获取string,例[10-12节]
        //console.log("获取课程时间成功成功")
        //console.log(`当前获取到的string为${sectionString}`)
        let sectionSlot = sectionString.match(/(\d+)-(\d+)/)
        //console.log(`当前获取到的sectionslot为${sectionSlot}`)

        let startSection = Number(sectionSlot[1])//开始节次
        let endSection = Number(sectionSlot[2])//结束节次
        let classSection = []
        for (let i = startSection; i <= endSection; i++) {
          classSection.push(i)
        }
        classObj.sections = classSection

        //🐱下面设置weeks属性，提取出上课的周数.🐱
        let weekTimeString = ""
        if (spans.length == 7)
          weekTimeString = spans[3].textContent.trim()
        else
          weekTimeString = spans[4].textContent.trim()

        let weekTimeStringArray = weekTimeString.match(/\d+-\d+|\d+/g)
        //stringarray形如[ '1-5', '7-9', '11-13' ]
        //console.log(`捕获到的数组为${weekTimeStringArray}`)

        let weektimeIntArray = []
        weekTimeStringArray.forEach(time => {
          if (time.includes("-"))//说明这是一个有间隔的周数
          {
            //console.log("有间隔的周！")
            let timeSlot = time.split("-")
            let startTime = Number(timeSlot[0])//开始周
            let endTime = Number(timeSlot[1])//结束周
            //console.log(`开始周${startTime}，结束周${endTime}`)
            for (let i = startTime; i <= endTime; i++) weektimeIntArray.push(i)
          }
          else weektimeIntArray.push(Number(time))
        })
        classObj.weeks = weektimeIntArray

        //console.log(classObj)
        result.push(classObj)
      })//容器处理完毕

      //console.log(`以上课程对应日期为周${day}`)
      //console.log("————————————————————————")
      day += 1//正确对应每个td对应的日期

    })//课程消息处理完毕

  })
  return result//完成喽!
}

async function scheduleTimer({providerRes,parserRes} = {}) {
  // 支持异步操作 推荐await写法

  // 这个函数中也支持使用 AIScheduleTools 譬如给出多条时间配置让用户选择之类的

  // 返回时间配置JSON，所有项都为可选项，如果不进行时间配置，请返回空对象
  return {
    totalWeek: 20, // 总周数：[1, 30]之间的整数
    startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
    startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
    showWeekend: true, // 是否显示周末
    forenoon: 4, // 上午课程节数：[1, 10]之间的整数
    afternoon: 5, // 下午课程节数：[0, 10]之间的整数
    night: 3, // 晚间课程节数：[0, 10]之间的整数
    sections: [{
      section: 1, // 节次：[1, 30]之间的整数
      startTime: '08:30', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '09:15', // 结束时间：同上
    },
    {
      section: 2, // 节次：[1, 30]之间的整数
      startTime: '09:25', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '10:10', // 结束时间：同上
    },
    {
      section: 3, // 节次：[1, 30]之间的整数
      startTime: '10:30', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '11:15', // 结束时间：同上
    },
    {
      section: 4, // 节次：[1, 30]之间的整数
      startTime: '11:25', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '12:10', // 结束时间：同上
    },
    {
      section: 5, // 节次：[1, 30]之间的整数
      startTime: '13:30', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '14:15', // 结束时间：同上
    },
    {
      section: 6, // 节次：[1, 30]之间的整数
      startTime: '14:25', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '15:10', // 结束时间：同上
    },
    {
      section: 7, // 节次：[1, 30]之间的整数
      startTime: '15:20', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '16:05', // 结束时间：同上
    },
    {
      section: 8, // 节次：[1, 30]之间的整数
      startTime: '16:25', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '17:10', // 结束时间：同上
    },
    {
      section: 9, // 节次：[1, 30]之间的整数
      startTime: '17:20', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '18:05', // 结束时间：同上
    },
    {
      section: 10, // 节次：[1, 30]之间的整数
      startTime: '19:00', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '19:45', // 结束时间：同上
    },
    {
      section: 11, // 节次：[1, 30]之间的整数
      startTime: '19:55', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '20:40', // 结束时间：同上
    },
    {
      section: 12, // 节次：[1, 30]之间的整数
      startTime: '20:50', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '21:35', // 结束时间：同上
    }], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
  }
  //WJZ_P:感觉这样分配好些?
}



let str1 = "[1-16周]"
let str2 = "[11,13-14周]"
let str3 = "[1-5,7-9,11-13周]"
let str4 = "[5,7,9,11周]"
let str5 = "[1-8,9,11-12周]"
let regex = /\d+-\d+|\d+/g
console.log(str1.match(regex))
console.log(str2.match(regex))
console.log(str3.match(regex))
console.log(str4.match(regex))
console.log(str5.match(regex))



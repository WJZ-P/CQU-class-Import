async function scheduleHtmlProvider() {//函数名不要动
    await loadTool('AIScheduleTools')//加载工具包
    console.log("工具包加载完成")
    const res = await fetch('https://my.cqu.edu.cn/api/timetable/class/timetable/stu/schedule-detail', {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + localStorage.getItem("cqu_edu_CURRENT_TOKEN").replace(/"/g, ""),
        }
    })

    await AIScheduleAlert({
        titleText: '欢迎使用(・`ω´・)!', // 标题内容，字体比较大，不传默认为提示
        contentText: '点击确认就可以导入辣!\n(*＞ｖ＜)ゞ*゜+\n\n——WJZ_P', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试
        confirmText: '确认(*￣▽￣)d', // 确认按钮文字，可不传默认为确认
    })
    myjson=await res.json()
    console.log(myjson)
    return JSON.stringify(myjson)
}

function scheduleHtmlParser(tableJson) {
    const myjson = JSON.parse(tableJson)
    console.log(myjson)
    const result = []
    const classTimetableVOList = myjson.classTimetableVOList
    console.log(classTimetableVOList)
    //下面对每个课程元素进行操作
    classTimetableVOList.forEach(classJson => {
        let classInfo = {}
        classInfo.name = classJson.courseName       //获取课程名称
        classInfo.position = classJson.roomName     //获取教室地点
        classInfo.teacher = classJson.instructorName//老师名称
        classInfo.day = classJson.weekDay           //获取是周几上课
        //下面获取节次
        let sectionString = classJson.periodFormat//获取string,例[10-12节]
        if(sectionString==null|| sectionString=="")
        {
          console.log("！！！！！！！！准备退出这次循环！")
          return 
        }           //如果有问题就直接结束循环。
        //else console.log("没问题")
        //比如整周的课的section就是null

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

        classInfo.sections = classSection//设置是第几节课上课

        //下面获取周数,例："1-13"  "1-5,7-9,11-13"   "5,7,9,11"
        let weekTime=classJson.teachingWeekFormat
        //console.log("周次数为",weekTime)
        weekTime=weekTime.match(/\d+-\d+|\d+/g)
        //console.log("切分后为",weekTime)
        let weektimeIntArray = []
        weekTime.forEach(time => {
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
        classInfo.weeks = weektimeIntArray//设置周数
        result.push(classInfo)
    })
    return result
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




let str1="1-13"
let str2="1-5,7-9,11-13"
let str3="5,7,9,11"

console.log(str1.match(/(\d+)-(\d+)|\d+/g))
console.log(str2.match(/(\d+)-(\d+)|\d+/g))
console.log(str3.match(/(\d+)-(\d+)|\d+/g))
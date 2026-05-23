// 创建一个代理函数来修改请求体
function createModifiedRequestBody(originalBody) {
  // 深拷贝原始对象
  const modifiedBody = JSON.parse(JSON.stringify(originalBody));
  
  // 将 creditHours 修改为 totalTime 的值
  if (modifiedBody.hasOwnProperty('totalTime') && modifiedBody.hasOwnProperty('creditHours')) {
    modifiedBody.creditHours = modifiedBody.totalTime;
  }
  
  return modifiedBody;
}

// 使用方式：
const requestBody = {
  "userName": "xxx",
  "courseHour": 5,
  "creditHours": 21,
  "educationTrainingDtlId": "2026052206034525186016",
  "userCode": "68xxxx",
  "safetyStudyMstId": "20260521144141366757760",
  "totalTime": 300
};

// 修改后的请求体
const modifiedBody = createModifiedRequestBody(requestBody);
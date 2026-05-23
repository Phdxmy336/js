function syncCreditHoursToTotalTime(requestBody) {
  return {
    ...requestBody,
    creditHours: requestBody.totalTime
  };
}
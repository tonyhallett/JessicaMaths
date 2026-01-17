const replaceSuffixes = (
  replacedQuestion: string,
  parameterValues: string[]
) => {
  // need to replace any suffixes in question - {s1} etc
  return replacedQuestion.replace(/{s(\d+)}/g, (match, p1) => {
    const suffixNumber = parseInt(p1, 10);
    const parameter = parameterValues[suffixNumber - 1];
    const isGreaterThanOne = parseFloat(parameter!) > 1;
    return isGreaterThanOne ? "s" : "";
  });
};

export default replaceSuffixes;

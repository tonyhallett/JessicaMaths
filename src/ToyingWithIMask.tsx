import { IMaskInput } from "react-imask";
import IMask, { MaskedNumber, MaskedPattern, MaskedRegExp } from "imask";

export const ToyingWithIMask = () => {
  const integerMask = new MaskedNumber({
    scale: 0,
    thousandsSeparator: "",
  });
  const letterRegexMask = new MaskedRegExp({
    mask: /^[A-Za-z0-9 ]*$/,
  });

  const romanNumeralMask = new MaskedRegExp({
    mask: /^([IVXLCDM]+)$/,
  });
  const greaterThanOrLessThanMask = new MaskedRegExp({
    mask: /^[<|>]$/,
  });

  const createDecimalMoneyMask = (currency: string): MaskedPattern => {
    return new MaskedPattern({
      mask: `${currency}num.dec`,
      blocks: {
        num: {
          mask: new MaskedRegExp({
            mask: /^(0|[1-9][0-9]*)$/,
          }),
        },
        dec: {
          mask: "00",
        },
      },
      lazy: false,
    });
  };

  const createPrefixSuffixNumberMask = (
    prefixOrSuffix: string,
    isPrefix: boolean
  ): MaskedPattern => {
    return new MaskedPattern({
      mask: isPrefix ? `${prefixOrSuffix} #` : `# ${prefixOrSuffix}`,
      blocks: {
        "#": { mask: /^(0|[1-9][0-9]*)$/ },
      },
      lazy: false,
    });
  };

  return (
    <>
      <IMaskInput mask={integerMask} />
      <br />
      <IMaskInput mask="a" />
      <br />
      <IMaskInput mask={letterRegexMask} />
      <br />
      <IMaskInput mask={romanNumeralMask} />
      <br />
      <IMaskInput mask={createPrefixSuffixNumberMask("kg", true)} />
      <br />
      <IMaskInput mask={createPrefixSuffixNumberMask("kg", false)} />
      <br />
      <IMaskInput mask={greaterThanOrLessThanMask} />
      <br />
      <IMaskInput mask={createDecimalMoneyMask("$")} />
    </>
  );
};

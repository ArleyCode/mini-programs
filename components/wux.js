import productbuyitem from 'product-buyitem/product-buyitem'
import Prompt from 'prompt/prompt'
import PickerCity from 'picker-city/picker-city'

export default function (scope) {
    return {
        $wuxProductBuyItem: new productbuyitem(scope).$wuxProductBuyItem,
        $wuxPrompt: new Prompt(scope).$wuxPrompt,
        $wuxPickerCity: new PickerCity(scope).$wuxPickerCity, 
    } 
}
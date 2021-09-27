
/**
 * Statics for some constants
 * @class kazagumoUtils
 */
module.exports = {
    /**
     * Move an item on array to a specific index
     * @param {Array} arr Main array
     * @param {number} old_index Old index
     * @param {number} new_index New index
     * @returns {Array}
     * @memberOf kazagumoUtils
     */
    moveArray: (arr, old_index, new_index) => {
        if (new_index >= arr.length) {
            let k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }
}
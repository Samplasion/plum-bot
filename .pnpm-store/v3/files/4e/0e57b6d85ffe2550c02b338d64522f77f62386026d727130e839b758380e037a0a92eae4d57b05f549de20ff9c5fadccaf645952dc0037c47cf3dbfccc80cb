const deprecate = require('deprecate')

class List extends Array {
  constructor(...args) {
    super(...args)
  }

  static fromArray(arr) {
    var list = new List()
    list.pushArray(arr)
    return list
  }

  static isList(arg) {
    if (!arg) return false
    return Object.prototype.toString.call(arg) === '[object List]';
  }

  get [Symbol.toStringTag]() {
    return 'List'
  }

  pushArray(arr) {
    arr.forEach(i => this.push(i))
    return this;
  }

  random() {
    return this[Math.floor(Math.random()*this.length)]
  }

  even() {
    var elems = []
      , count = 0;
    for (var i of this) {
      if (count % 2 == 0) elems.push(i)
      count++
    }
    return List.fromArray(elems)
  }

  odd() {
    var elems = []
      , count = 0;
    for (var i of this) {
      if (count % 2 == 1) elems.push(i)
      count++
    }
    return List.fromArray(elems)
  }

  shuffle() {
    for (var i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]]
    }
    return this
  }

  toArray() {
    var arr = []
    for (var i of this) arr.push(i)
    return arr
  }

  clone() {
    return List.fromArray(this.toArray())
  }

  none(cb) {
    return !(this.every(cb))
  }

  get first() {
    return this[0]
  }

  get last() {
    return this[this.length-1]
  }

  joinWithLast(last = ', ', joiner = ', ') {
    if (this.length == 0) return ''
    if (this.length == 1) return this[0]
    if (this.length == 2) return `${this[0]} ${last} ${this[1]}`
    var arr = new List()
    for (var i = 0; i <= this.length - 2; i++) {
      arr.push(this[i])
    }
    return arr.join(joiner) + ` ${last} ${this.last}`
  }

  joinAnd(jnr = ', ') {
    return this.joinWithLast('and', jnr)
  }

  joinOr(jnr = ', ') {
    return this.joinWithLast('or', jnr)
  }

  toObject() {
    var obj = {}
    for (var i = 0; i < this.length; i++) {
      obj[i] = this[i]
    }
    return obj
  }

  remove(cb) {
    var ret = new List()
    for (var i = 0; i < this.length; i++) {
      if (cb(this[i])) {
	       ret.push(this.splice(i, 1).first())
      }
    }
    return ret;
  }

  drop(cb) {
    this.remove(cb)
    return this
  }

  flatten() {
    return this.reduce((a, b) => a.concat((List.isList(b)) ? b.flatten() : (Array.isArray(b) ? List.fromArray(b).flatten() : b)), new List())
  }

  reject(cb) {
    return this.filter(i => !cb(i));
  }

  uniq() {
    var result = new List()
    this.forEach(function(item) {
         if(result.indexOf(item) < 0) {
             result.push(item);
         }
    });
    return result;
  }
}

module.exports = List

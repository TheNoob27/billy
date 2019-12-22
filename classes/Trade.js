class Trade {
  constructor(trade1, trade2) {
    trade2.trade = this
    trade2.tradingWith = trade1
  }
}

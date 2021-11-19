script {
    use 0x1::Signer;
    use gkQ5K6EnLRgZkwozG8GiBAEnJyM6FxzbSaSmVhKJ2w8FcK7ih::Dia;

    /// Set value.
    /// C is currency generic, e.g. BTC, KSM, PONT, etc.
    fun set_value<C: store>(account: signer, value: u128, timestamp: u64) {
        let acc_addr = Signer::address_of(&account);

        Dia::setValue<C>(&account, value, timestamp);

        let (v, t) = Dia::getValue<C>(acc_addr);

        assert(v == value, 101);
        assert(t == timestamp, 102);
    }
}

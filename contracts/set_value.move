script {
    use 0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d::Dia;
    use 0x1::Signer;

    fun set_value<C1: store, C2: store>(account: signer, value: u128, timestamp: u64) {
        let acc_addr = Signer::address_of(&account);

        Dia::setValue<C1, C2>(&account, value, timestamp);

        let (v, t) = Dia::getValue<C1, C2>(acc_addr);

        assert(v == value, 101);
        assert(t == timestamp, 102);
    }
}

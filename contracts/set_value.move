script {
    use 0x1::Signer;
    use 0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d::Dia;
    fun set_value<C: store>(account: signer, value: u128, timestamp: u64) {
        let acc_addr = Signer::address_of(&account);

        Dia::setValue<C>(&account, value, timestamp);

        let (v, t) = Dia::getValue<C>(acc_addr);

        assert(v == value, 101);
        assert(t == timestamp, 102);
    }
}

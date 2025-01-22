UPDATE PUBLIC.ASSETS
SET PYTH_PRICE_FEED_ID = CASE SYMBOL
    WHEN 'BTC' THEN '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
    WHEN 'ETH' THEN '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
    WHEN 'SOL' THEN '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'
    WHEN 'SUI' THEN '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744'
    WHEN 'ADA' THEN '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d'
    WHEN 'APT' THEN '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5'
    WHEN 'DOGE' THEN '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c'
    WHEN 'XRP' THEN '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
    WHEN 'USDT' THEN '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b'
    WHEN 'BNB' THEN '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f'
    WHEN 'USDC' THEN '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
    WHEN 'STETH' THEN '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5'
    WHEN 'TRX' THEN '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b'
    WHEN 'LINK' THEN '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221'
    WHEN 'AVAX' THEN '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7'
    WHEN 'WSTETH' THEN '0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784'
    WHEN 'WBTC' THEN '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33'
    WHEN 'TON' THEN '0x8963217838ab4cf5cadc172203c1f0b763fbaa45f346d8ee50ba994bbcac3026'
    WHEN 'XLM' THEN '0xb7a8eba68a997cd0210c2e1e4ee811ad2d174b3611c22d9ebf16f4cb7e9ba850'
    WHEN 'HBAR' THEN '0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd'
    WHEN 'SHIB' THEN '0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a'
END
WHERE SYMBOL IN ('BTC', 'ETH', 'SOL', 'ADA', 'APT', 'DOGE', 'XRP', 'SUI', 'USDT', 'BNB', 'USDC', 'STETH', 'TRX', 'LINK', 'AVAX', 'WSTETH', 'WBTC', 'TON', 'XLM', 'HBAR', 'SHIB');
<?php

namespace App\Helpers;

class WalletDetector
{
    private static array $prefixMap = [
        '741' => 'VMCASHIN',
        '742' => 'VMCASHIN',
        '743' => 'VMCASHIN',
        '744' => 'VMCASHIN',
        '745' => 'VMCASHIN',
        '746' => 'VMCASHIN',
        '747' => 'VMCASHIN',
        '754' => 'VMCASHIN',
        '755' => 'VMCASHIN',
        '756' => 'VMCASHIN',
        '757' => 'VMCASHIN',
        '76'  => 'VMCASHIN',
        '77'  => 'VMCASHIN',
        '67'  => 'AMCASHIN',
        '68'  => 'AMCASHIN',
        '69'  => 'AMCASHIN',
        '78'  => 'AMCASHIN',
        '79'  => 'AMCASHIN',
        '65'  => 'TPCASHIN',
        '71'  => 'TPCASHIN',
        '61'  => 'HPCASHIN',
        '62'  => 'HPCASHIN',
        '63'  => 'ZPCASHIN',
    ];

    public static function normalize(string $msisdn): string
    {
        $digits = preg_replace('/\D/', '', $msisdn);

        if (str_starts_with($digits, '255')) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '255' . substr($digits, 1);
        }

        return '255' . $digits;
    }

    public static function detect(string $msisdn): ?string
    {
        $normalized = self::normalize($msisdn);

        if (! str_starts_with($normalized, '255')) {
            return null;
        }

        $local = substr($normalized, 3);

        foreach (self::$prefixMap as $prefix => $code) {
            if (str_starts_with($local, $prefix)) {
                return $code;
            }
        }

        return null;
    }

    public static function publicName(?string $walletType): ?string
    {
        return match ($walletType) {
            'VMCASHIN' => 'vodacom',
            'AMCASHIN' => 'airtel',
            'TPCASHIN' => 'tigo',
            'HPCASHIN' => 'halopesa',
            'ZPCASHIN' => 'zantel',
            default => $walletType,
        };
    }
}

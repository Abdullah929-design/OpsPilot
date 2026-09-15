<?php

namespace App\Enums;

enum EmploymentStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case TERMINATED = 'terminated';
}

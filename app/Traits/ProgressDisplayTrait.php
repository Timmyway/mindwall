<?php

namespace App\Traits;

trait ProgressDisplayTrait
{
    public function displayProgress($total, $progress, $name = null)
    {
        $this->command->getOutput()->writeln("Inserted $progress out of $total. ($name)");
    }
}

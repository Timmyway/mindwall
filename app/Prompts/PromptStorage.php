<?php

namespace App\Prompts;

class PromptStorage
{
    private $prompt;
    private $count;
    private $thematic;

    public function __construct(int $count = 10) {
        $this->count = $count;
    }

    function getPrompt()
    {
        return $this->prompt;
    }

    function setCount(int $n)
    {
        $this->count = $n;
        return $this;
    }

    function setThematic(string $thematic)
    {
        $this->thematic = $thematic;
        return $this;
    }

    function cookPrompt(string $promptView, array $variables)
    {
        // Render the text with the variables replaced
        $renderedPrompt = view('prompts.'.$promptView, $variables)->render();

        $this->prompt = $renderedPrompt;
        return $this;
    }
}

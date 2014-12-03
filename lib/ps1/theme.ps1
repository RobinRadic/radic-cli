#!/bin/sh

#######################################
# LIQUID PROMPT DEFAULT TEMPLATE FILE #
#######################################

# Available features:
# LP_BATT battery
# LP_LOAD load
# LP_JOBS screen sessions/running jobs/suspended jobs
# LP_USER user
# LP_HOST hostname
# LP_PERM a colon ":"
# LP_PWD current working directory
# LP_PROXY HTTP proxy
# LP_VCS the content of the current repository
# LP_ERR last error code
# LP_MARK prompt mark
# LP_TIME current time
# LP_RUNTIME runtime of last command
# LP_PS1_PREFIX user-defined general-purpose prefix (default set a generic prompt as the window title)

# Remember that most features come with their corresponding colors,
# see the README.

prompt_setup_gitv() {
        local LP_VCS=""
        local LP_VCS_TYPE=""

        if _lp_are_vcs_enabled; then
            LP_VCS="$(_lp_git_branch_color)"
            LP_VCS_TYPE="git"
            if [[ -n "$LP_VCS" ]]; then
                # If this is a git-svn repository
                if [[ -d "$(\git rev-parse --git-dir 2>/dev/null)/svn" ]]; then
                    LP_VCS_TYPE="git-svn"
                fi # git-svn
            else
                LP_VCS="$(_lp_hg_branch_color)"
                LP_VCS_TYPE="hg"
                if [[ -z "$LP_VCS" ]]; then
                    LP_VCS="$(_lp_svn_branch_color)"
                    LP_VCS_TYPE="svn"
                    if [[ -z "$LP_VCS" ]]; then
                        LP_VCS="$(_lp_fossil_branch_color)"
                        LP_VCS_TYPE="fossil"
                        if [[ -z "$LP_VCS" ]]; then
                            LP_VCS="$(_lp_bzr_branch_color)"
                            LP_VCS_TYPE="bzr"
                            if [[ -z "$LP_VCS" ]]; then
                                LP_VCS=""
                                LP_VCS_TYPE=""
                            fi # nothing
                        fi # bzr
                    fi # fossil
                fi # svn
            fi # hg

        else # if this vcs rep is disabled
            LP_VCS="" # not necessary, but more readable
            LP_VCS_TYPE="disabled"
        fi

        if [[ -z "$LP_VCS_TYPE" ]] ; then
            LP_VCS=""
        else
            LP_VCS="${LP_VCS}"
        fi

        # end of the prompt line: double spaces
        local LP_MARK="$(_lp_sb "$(_lp_smart_mark $LP_VCS_TYPE)")"

        echo "$LP_VCS"
        echo ;
}



setup_prompt()
{



    local off="\[\e[0m\]"
    local bold="\[\e[1m\]"

    local white="\[\e[38;5;15m\]"
    local lightgrey="\[\e[38;5;252m\]"
    local medgrey="\[\e[38;5;247m\]"
    local grey="\[\e[38;5;242m\]"
    local verygrey="\[\e[38;5;236m\]"
    local black="\[\e[38;5;232m\]"

    local green="\[\e[38;5;82m\]"

    local yellow="\[\e[38;5;226m\]"
    local darkyellow="\[\e[38;5;220m\]"

    local orange="\[\e[38;5;202m\]"
    local red="\[\e[38;5;160m\]"


    local amarokFc="\[\e[38;5;111m\]"

    local bg_lightgrey="\[\e[48;5;242m\]"
    local bg_medgrey="\[\e[48;5;239m\]"
    local bg_grey="\[\e[48;5;237m\]"
    local bg_verygrey="\[\e[48;5;234m\]"
    local bg_black="\[\e[48;5;232m\]"
    local bg_green="\[\e[48;5;82m\]"
    local bg_yellow="\[\e[48;5;226m\]"
    local bg_darkyellow="\[\e[48;5;220m\]"
    local bg_orange="\[\e[48;5;202m\]"

    local branch="git branch | sed 's/*/git:/g'"


HOSTCOL=`python -W ignore::DeprecationWarning -c "
import commands, md5
colorTuples = zip( [0]*8 + [1]*8, range(30,39)*2 )
hostname = 'papa'
index = int(   md5.md5(hostname).hexdigest(), 16   ) % len(colorTuples)
hostColor = r'%d;%dm' % colorTuples[index]
print hostColor
"`
HOSTCOL="\[\033[$HOSTCOL\]"



    # LP_PERM: shows a "::" or "xx"
    # - colored in green if user has write permission on the current dir
    # - colored in red if not

    if [[ -w "${PWD}" ]]; then
        LP_PERM="${green}|"
    else
        LP_PERM="${red}|"
    fi

    # add time, jobs, load and battery
    #LP_PS1="AA ${LP_PS1_PREFIX}${LP_TIME}${LP_BATT}${LP_LOAD}${LP_JOBS}"
    # ${LP_VENV}${LP_PROXY}

    # TIME
    LP_PS1="${LP_PS1_PREFIX}${bg_grey}${orange} \A ${off}"

    # USER
    local userFc=$yellow
    if [[ "$EUID" -ne "0" ]]; then userFc=$grey; fi
    LP_PS1="${LP_PS1}${bg_verygrey}${userFc} \u ${off}"

    # HOSTNAME - colored by hostname by python
    LP_PS1="${LP_PS1}${HOSTCOL}${bg_grey}${bold} \H ${off}"

    # CURRENT WORKING DIR FULL PATH + PERMISSION
    LP_PS1="${LP_PS1}${bg_medgrey}${verygrey}${LP_PERM}${black}${bold} \w ${LP_PERM}${off}"

    # VERSION CONTROL OF DIR STATUS (IF AVAILABLE)
    local promptsetupgitv="$(prompt_setup_gitv)"
    _NO_COL=$NO_COL #prompt_setup_gitv bg fix
    NO_COL=$bg_grey
    if [[ $promptsetupgitv ]]; then
        LP_PS1="${LP_PS1}${bg_grey}${lightgrey} $(prompt_setup_gitv) ${off}"
    fi
    NO_COL=$_NO_COL


    # Amarok current song

        local amarokOk=$(eval `qdbus | grep amarok`)

    if ! [ -z "$amarokOk" ]; then


    if [[ $DISPLAY ]]; then



            local amarokSongTitle="$(eval 'qdbus org.mpris.amarok /Player GetMetadata | grep title | sed s/title:\ //g')"
            if [[ $amarokSongTitle ]]; then
                amarokSongPosition="$(eval 'qdbus org.mpris.amarok /Player PositionGet')"
                amarokSongLength="$(eval 'qdbus org.mpris.amarok /Player GetMetadata | grep mtime | sed s/mtime:\ //g')"
             #   amarokSongLengthMinutes="$(eval "php -r 'echo ceil($amarokSongLength/1000/60, 2);'")"

             #   echo "$amarokSongLengthMinutes;"

                LP_PS1="${LP_PS1}${amarokFc}${bg_medgrey}${bold} ♪ ${amarokSongTitle} ♬ ${off}"
            fi
    fi
fi
        # NEWLINE THEN PROMPT MARKER. END OF PS1
        export LP_PS1="${LP_PS1}\n${bg_grey}${darkyellow}${bold} \$ ${off} "
        export PS2="${bg_grey}${darkyellow}${bold} > ${off} "


}

# 3768000 / 1000 / 60


setup_prompt


# "invisible" parts
# Get the current prompt on the fly and make it a title
LP_TITLE=$(_lp_title $PS1)

# Insert it in the prompt
PS1="${LP_TITLE}${PS1}"
